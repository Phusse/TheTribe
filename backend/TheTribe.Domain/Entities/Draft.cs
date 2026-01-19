using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TheTribe.Domain.Entities;

public class Draft
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
