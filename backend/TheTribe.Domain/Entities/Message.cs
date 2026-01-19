using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TheTribe.Domain.Entities;

public class Message
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public Guid? ReceiverId { get; set; }
    public User? Receiver { get; set; }

    public Guid? ChatRoomId { get; set; }
    public ChatRoom? ChatRoom { get; set; }

    // Read status tracking
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
}
