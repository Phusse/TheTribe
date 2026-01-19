using System.ComponentModel.DataAnnotations;

namespace TheTribe.Domain.Entities;

public class ChatRoom
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }  // Optional group profile picture

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public ICollection<ChatRoomMember> Members { get; set; } = new List<ChatRoomMember>();
}

public class ChatRoomMember
{
    public Guid ChatRoomId { get; set; }
    public ChatRoom ChatRoom { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
