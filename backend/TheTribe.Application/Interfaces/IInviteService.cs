using TheTribe.Application.DTOs.Invites;

namespace TheTribe.Application.Interfaces;

public interface IInviteService
{
    Task<InviteResponse> GenerateInviteAsync(Guid adminId);
    Task<IEnumerable<InviteResponse>> GetAllInvitesAsync();
    Task RevokeInviteAsync(Guid inviteId);
}
