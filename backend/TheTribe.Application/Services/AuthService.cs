using Microsoft.Extensions.Configuration;
using TheTribe.Application.DTOs.Auth;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials."); 
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Your account has been suspended.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _unitOfWork.Users.GetByEmailAsync(request.Email) != null)
        {
            throw new Exception("User with this email already exists");
        }

        Invite? invite = null;
        
        if (!string.IsNullOrWhiteSpace(request.InviteCode))
        {
            var invites = await _unitOfWork.Invites.FindAsync(i => i.Code == request.InviteCode && !i.IsUsed);
            invite = invites.FirstOrDefault();
            
            if (invite is null)
            {
                throw new Exception("Invalid or used invite code");
            }
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = UserRole.Member,
            UsedInvite = invite,
            CreatedAt = DateTime.UtcNow
        };

        if (invite != null)
        {
            invite.IsUsed = true;
            invite.UsedAt = DateTime.UtcNow;
            invite.UsedByUser = user;
        }

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        // Find the refresh token
        var tokens = await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == refreshToken);
        var token = tokens.FirstOrDefault();

        if (token == null)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        if (!token.IsActive)
        {
            if (token.IsExpired)
                throw new UnauthorizedAccessException("Refresh token has expired. Please login again.");
            else
                throw new UnauthorizedAccessException("Refresh token has been revoked.");
        }

        // Get the user
        var user = await _unitOfWork.Users.GetByIdAsync(token.UserId);
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("User not found or suspended.");

        // Revoke old token and create new one (rotation)
        token.RevokedAt = DateTime.UtcNow;
        var newRefreshToken = await CreateRefreshTokenAsync(user.Id);
        token.ReplacedByToken = newRefreshToken.Token;
        
        await _unitOfWork.CompleteAsync();

        // Generate new access token
        var accessToken = _jwtTokenGenerator.GenerateToken(user);
        var expiryMinutes = double.Parse(_configuration["JwtSettings:ExpiryMinutes"]!);

        return new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            accessToken,
            newRefreshToken.Token,
            user.Role.ToString(),
            DateTime.UtcNow.AddMinutes(expiryMinutes)
        );
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var tokens = await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == refreshToken);
        var token = tokens.FirstOrDefault();

        if (token != null && token.IsActive)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _unitOfWork.CompleteAsync();
        }
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var accessToken = _jwtTokenGenerator.GenerateToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);
        var expiryMinutes = double.Parse(_configuration["JwtSettings:ExpiryMinutes"]!);

        return new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            accessToken,
            refreshToken.Token,
            user.Role.ToString(),
            DateTime.UtcNow.AddMinutes(expiryMinutes)
        );
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId)
    {
        var refreshTokenDays = double.Parse(_configuration["JwtSettings:RefreshTokenExpiryDays"] ?? "7");
        
        var refreshToken = new RefreshToken
        {
            Token = _jwtTokenGenerator.GenerateRefreshToken(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays)
        };

        await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
        return refreshToken;
    }

    public async Task<string> FixSuperAdminPasswordAsync()
    {
        var allUsers = await _unitOfWork.Users.GetAllAsync();
        var superAdmin = allUsers.FirstOrDefault(u => u.Role == UserRole.SuperAdmin);
        
        if (superAdmin == null)
        {
            superAdmin = allUsers.FirstOrDefault(u => 
                u.Email.ToLower() == "superadmin@tribe.com");
        }
        
        if (superAdmin == null)
        {
            throw new Exception($"Super Admin not found. Found {allUsers.Count()} users in database.");
        }

        var oldEmail = superAdmin.Email;
        superAdmin.Email = "superadmin@tribe.com";
        superAdmin.PasswordHash = _passwordHasher.Hash("Password123!");
        
        _unitOfWork.Users.Update(superAdmin);
        await _unitOfWork.CompleteAsync();
        
        return $"Fixed! Old email was: '{oldEmail}'. New email: 'superadmin@tribe.com'. Password: 'Password123!'";
    }
}
