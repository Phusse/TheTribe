using TheTribe.Application.DTOs.Auth;

namespace TheTribe.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<string> FixSuperAdminPasswordAsync();
}
