using TheTribe.Application.Interfaces.Repositories;

namespace TheTribe.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IGenericRepository<TheTribe.Domain.Entities.Invite> Invites { get; }
    IGenericRepository<TheTribe.Domain.Entities.TrainingModule> TrainingModules { get; }
    IGenericRepository<TheTribe.Domain.Entities.LiveSession> LiveSessions { get; }
    IGenericRepository<TheTribe.Domain.Entities.Message> Messages { get; }
    IGenericRepository<TheTribe.Domain.Entities.Draft> Drafts { get; }
    IGenericRepository<TheTribe.Domain.Entities.Connection> Connections { get; }
    IGenericRepository<TheTribe.Domain.Entities.ChatRoom> ChatRooms { get; }
    IGenericRepository<TheTribe.Domain.Entities.ChatRoomMember> ChatRoomMembers { get; }
    IGenericRepository<TheTribe.Domain.Entities.RefreshToken> RefreshTokens { get; }
    
    Task<int> CompleteAsync();
}
