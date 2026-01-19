using TheTribe.Application.DTOs.Auth;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null) // For security, generic message
        {
             // Simulate work
             // In real app, verify password to prevent timing attacks, here MVP
             throw new UnauthorizedAccessException("Invalid credentials."); 
        }

        if (!user.IsActive)
        {
             throw new UnauthorizedAccessException("Your account has been suspended.");
        }

        // Verify Password
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponse(user.Id, user.Email, user.FirstName, user.LastName, token, user.Role.ToString());
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validate Email uniqueness first
        if (await _unitOfWork.Users.GetByEmailAsync(request.Email) != null)
        {
            throw new Exception("User with this email already exists");
        }

        Invite? invite = null;
        
        // Only validate invite code if one is provided
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

        // Mark invite as used if one was provided
        if (invite != null)
        {
            invite.IsUsed = true;
            invite.UsedAt = DateTime.UtcNow;
            invite.UsedByUser = user;
        }

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        var token = _jwtTokenGenerator.GenerateToken(user);
        
        return new AuthResponse(user.Id, user.Email, user.FirstName, user.LastName, token, user.Role.ToString());
    }

    public async Task<string> FixSuperAdminPasswordAsync()
    {
        // Find super admin by role (more reliable than email)
        var allUsers = await _unitOfWork.Users.GetAllAsync();
        var superAdmin = allUsers.FirstOrDefault(u => u.Role == UserRole.SuperAdmin);
        
        // Fallback: try email with case-insensitive search
        if (superAdmin == null)
        {
            superAdmin = allUsers.FirstOrDefault(u => 
                u.Email.ToLower() == "superadmin@tribe.com");
        }
        
        if (superAdmin == null)
        {
            throw new Exception($"Super Admin not found. Found {allUsers.Count()} users in database. Please check if any user has SuperAdmin role.");
        }

        var oldEmail = superAdmin.Email;
        
        // Fix email to standard value
        superAdmin.Email = "superadmin@tribe.com";
        
        // Regenerate the password hash properly
        superAdmin.PasswordHash = _passwordHasher.Hash("Password123!");
        
        _unitOfWork.Users.Update(superAdmin);
        await _unitOfWork.CompleteAsync();
        
        return $"Fixed! Old email was: '{oldEmail}'. New email: 'superadmin@tribe.com'. Password: 'Password123!'";
    }
}
