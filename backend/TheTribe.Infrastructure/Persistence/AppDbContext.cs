using Microsoft.EntityFrameworkCore;
using TheTribe.Domain.Entities;

namespace TheTribe.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Invite> Invites { get; set; } = null!;
    public DbSet<TrainingModule> TrainingModules { get; set; } = null!;
    public DbSet<LiveSession> LiveSessions { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Draft> Drafts { get; set; } = null!;
    public DbSet<Connection> Connections { get; set; } = null!;
    public DbSet<ChatRoom> ChatRooms { get; set; } = null!;
    public DbSet<ChatRoomMember> ChatRoomMembers { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ... (Existing configs) ...
        
        // ChatRoomMember: Composite Key
        modelBuilder.Entity<ChatRoomMember>()
            .HasKey(crm => new { crm.ChatRoomId, crm.UserId });

        modelBuilder.Entity<ChatRoomMember>()
            .HasOne(crm => crm.ChatRoom)
            .WithMany(cr => cr.Members)
            .HasForeignKey(crm => crm.ChatRoomId)
            .OnDelete(DeleteBehavior.Restrict); // Or Cascade if you want to remove members when room is deleted

        modelBuilder.Entity<ChatRoomMember>()
            .HasOne(crm => crm.User)
            .WithMany()
            .HasForeignKey(crm => crm.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Message -> ChatRoom
        modelBuilder.Entity<Message>()
            .HasOne(m => m.ChatRoom)
            .WithMany()
            .HasForeignKey(m => m.ChatRoomId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting room deletes messages
            
        // Configure relationships if needed
        modelBuilder.Entity<Invite>()
            .HasOne(i => i.CreatedByUser)
            .WithMany(u => u.CreatedInvites)
            .HasForeignKey(i => i.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Invite>()
            .HasOne(i => i.UsedByUser)
            .WithOne(u => u.UsedInvite)
            .HasForeignKey<Invite>(i => i.UsedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
            
        modelBuilder.Entity<Invite>()
            .HasIndex(i => i.Code)
            .IsUnique();

        // Message Relationships
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Receiver)
            .WithMany()
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Connection Relationships
        modelBuilder.Entity<Connection>()
            .HasOne(c => c.Requester)
            .WithMany()
            .HasForeignKey(c => c.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Connection>()
            .HasOne(c => c.Receiver)
            .WithMany()
            .HasForeignKey(c => c.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
