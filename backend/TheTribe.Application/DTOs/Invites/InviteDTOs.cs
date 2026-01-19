namespace TheTribe.Application.DTOs.Invites;

public record CreateInviteRequest(string? Code = null); // Optional custom code
public record InviteResponse(Guid Id, string Code, bool IsUsed, DateTime CreatedAt, DateTime? ExpiresAt, string? UsedByEmail, string CreatedByEmail);
