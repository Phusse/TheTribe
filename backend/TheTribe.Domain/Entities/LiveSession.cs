using System.ComponentModel.DataAnnotations;

namespace TheTribe.Domain.Entities;

public class LiveSession
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime ScheduledAt { get; set; }
    
    public string MeetingUrl { get; set; } = string.Empty; // Zoom/Meet link

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
