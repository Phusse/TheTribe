using TheTribe.Application.DTOs.Social;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Interfaces.Social;

public interface IConnectionService
{
    Task<ConnectionResponse> SendRequestAsync(Guid requesterId, Guid targetUserId);
    Task<ConnectionResponse> UpdateStatusAsync(Guid userId, Guid connectionId, ConnectionStatus status);
    Task<IEnumerable<ConnectionResponse>> GetConnectionsAsync(Guid userId);
    Task<IEnumerable<ConnectionResponse>> GetPendingRequestsAsync(Guid userId);
}
