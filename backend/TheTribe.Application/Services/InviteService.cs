using TheTribe.Application.DTOs.Invites;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;
using TheTribe.Application.Interfaces.Repositories; // For generic repo extensions if needed

namespace TheTribe.Application.Services;

public class InviteService : IInviteService
{
    private readonly IUnitOfWork _unitOfWork;

    public InviteService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<InviteResponse> GenerateInviteAsync(Guid adminId)
    {
        var code = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper(); // Simple 8-char code
        
        // Ensure uniqueness loop if strict, but collision low for MVP
        
        var invite = new Invite
        {
            Code = code,
            CreatedByUserId = adminId,
            CreatedAt = DateTime.UtcNow
            // ExpiresAt? Null for now (never expires until used)
        };

        await _unitOfWork.Invites.AddAsync(invite);
        await _unitOfWork.CompleteAsync();
        
        // Need to load relations? For response, we just have Code.
        // CreatedByEmail handling: In real app, we might need to fetch User. 
        // For MVP, we'll return empty string or specific Logic to load user.

        return new InviteResponse(invite.Id, invite.Code, invite.IsUsed, invite.CreatedAt, invite.ExpiresAt, null, "Admin"); 
    }

    public async Task<IEnumerable<InviteResponse>> GetAllInvitesAsync()
    {
        var invites = await _unitOfWork.Invites.GetAllAsync();
        return invites.Select(i => new InviteResponse(i.Id, i.Code, i.IsUsed, i.CreatedAt, i.ExpiresAt, i.UsedByUserId?.ToString(), i.CreatedByUserId?.ToString() ?? "System"));
    }

    public async Task RevokeInviteAsync(Guid inviteId)
    {
        var invite = await _unitOfWork.Invites.GetByIdAsync(inviteId);
        if (invite != null)
        {
            _unitOfWork.Invites.Remove(invite);
            await _unitOfWork.CompleteAsync();
        }
    }
}
