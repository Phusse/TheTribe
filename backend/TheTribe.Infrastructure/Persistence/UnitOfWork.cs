using TheTribe.Application.Interfaces;
using TheTribe.Application.Interfaces.Repositories;
using TheTribe.Domain.Entities;
using TheTribe.Infrastructure.Repositories;

namespace TheTribe.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IUserRepository Users { get; }
    public IGenericRepository<Invite> Invites { get; }
    public IGenericRepository<TrainingModule> TrainingModules { get; }
    public IGenericRepository<LiveSession> LiveSessions { get; }
    public IGenericRepository<Message> Messages { get; }
    public IGenericRepository<Draft> Drafts { get; }
    public IGenericRepository<Connection> Connections { get; }
    public IGenericRepository<ChatRoom> ChatRooms { get; }
    public IGenericRepository<ChatRoomMember> ChatRoomMembers { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Invites = new GenericRepository<Invite>(_context);
        TrainingModules = new GenericRepository<TrainingModule>(_context);
        LiveSessions = new GenericRepository<LiveSession>(_context);
        Messages = new GenericRepository<Message>(_context);
        Drafts = new GenericRepository<Draft>(_context);
        Connections = new GenericRepository<Connection>(_context);
        ChatRooms = new GenericRepository<ChatRoom>(_context);
        ChatRoomMembers = new GenericRepository<ChatRoomMember>(_context);
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
