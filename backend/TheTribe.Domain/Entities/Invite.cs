using System.ComponentModel.DataAnnotations;

namespace TheTribe.Domain.Entities;

public class Invite
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Code { get; set; } = string.Empty;

    public bool IsUsed { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }

    // Who created it (Admin)
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    // Who used it (New Member)
    public Guid? UsedByUserId { get; set; }
    public User? UsedByUser { get; set; }
}
