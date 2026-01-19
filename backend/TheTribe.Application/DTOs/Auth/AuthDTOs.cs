namespace TheTribe.Application.DTOs.Auth;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string? InviteCode, string Email, string Password, string FirstName, string LastName);
public record AuthResponse(Guid Id, string Email, string FirstName, string LastName, string AccessToken, string Role);
