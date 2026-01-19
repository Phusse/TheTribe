using System.ComponentModel.DataAnnotations;

namespace TheTribe.Domain.Entities;

public class TrainingModule
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public string VideoUrl { get; set; } = string.Empty; // External embed URL
    public string ThumbnailUrl { get; set; } = string.Empty;

    public bool IsPublished { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
