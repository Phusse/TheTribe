using TheTribe.Application.DTOs.Social;
using TheTribe.Application.Interfaces;
using TheTribe.Application.Interfaces.Social;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services.Social;

public class ConnectionService : IConnectionService
{
    private readonly IUnitOfWork _unitOfWork;

    public ConnectionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ConnectionResponse> SendRequestAsync(Guid requesterId, Guid targetUserId)
    {
        if (requesterId == targetUserId)
            throw new ArgumentException("Cannot connect with yourself.");

        var existing = await _unitOfWork.Connections.FindAsync(c => 
            (c.RequesterId == requesterId && c.ReceiverId == targetUserId) ||
            (c.RequesterId == targetUserId && c.ReceiverId == requesterId));
            
        if (existing.Any())
            throw new InvalidOperationException("Connection already exists.");

        var connection = new Connection
        {
            RequesterId = requesterId,
            ReceiverId = targetUserId,
            Status = ConnectionStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Connections.AddAsync(connection);
        await _unitOfWork.CompleteAsync();

        return await MapToResponse(connection);
    }

    public async Task<ConnectionResponse> UpdateStatusAsync(Guid userId, Guid connectionId, ConnectionStatus status)
    {
        var connection = await _unitOfWork.Connections.GetByIdAsync(connectionId);
        if (connection == null) throw new KeyNotFoundException("Connection not found.");

        // Only receiver can accept/reject pending
        if (connection.Status == ConnectionStatus.Pending && connection.ReceiverId != userId)
            throw new UnauthorizedAccessException("Only receiver can respond to request.");

        connection.Status = status;
        connection.UpdatedAt = DateTime.UtcNow;
        
        _unitOfWork.Connections.Update(connection);
        await _unitOfWork.CompleteAsync();

        return await MapToResponse(connection);
    }

    public async Task<IEnumerable<ConnectionResponse>> GetConnectionsAsync(Guid userId)
    {
        var all = await _unitOfWork.Connections.FindAsync(c => 
            (c.RequesterId == userId || c.ReceiverId == userId) && 
            c.Status == ConnectionStatus.Accepted);

        var result = new List<ConnectionResponse>();
        foreach(var c in all)
        {
            result.Add(await MapToResponse(c));
        }
        return result;
    }

    public async Task<IEnumerable<ConnectionResponse>> GetPendingRequestsAsync(Guid userId)
    {
        var pending = await _unitOfWork.Connections.FindAsync(c => 
            c.ReceiverId == userId && c.Status == ConnectionStatus.Pending);

        var result = new List<ConnectionResponse>();
        foreach(var c in pending)
        {
            result.Add(await MapToResponse(c));
        }
        return result;
    }

    private async Task<ConnectionResponse> MapToResponse(Connection c)
    {
        var requester = await _unitOfWork.Users.GetByIdAsync(c.RequesterId);
        var receiver = await _unitOfWork.Users.GetByIdAsync(c.ReceiverId);

        return new ConnectionResponse(
            c.Id,
            c.RequesterId,
            requester != null ? $"{requester.FirstName} {requester.LastName}" : "Unknown",
            c.ReceiverId,
            receiver != null ? $"{receiver.FirstName} {receiver.LastName}" : "Unknown",
            c.Status,
            c.CreatedAt
        );
    }
}
