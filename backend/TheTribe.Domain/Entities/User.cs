using System.ComponentModel.DataAnnotations;

namespace TheTribe.Domain.Entities;

public enum UserRole
{
    Member = 0,
    Admin = 1,
    SuperAdmin = 2
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    // Basic Info
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    
    // Profile Fields (optional, filled during onboarding)
    public string? ProfilePhotoUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Location { get; set; }
    public string? Timezone { get; set; }
    public string? Occupation { get; set; }
    
    // Account Status
    public UserRole Role { get; set; } = UserRole.Member;
    public bool IsActive { get; set; } = true;
    public bool IsProfileComplete { get; set; } = false;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public DateTime? ProfileUpdatedAt { get; set; }

    // Navigation properties
    public ICollection<Invite> CreatedInvites { get; set; } = new List<Invite>();
    public Invite? UsedInvite { get; set; }
}
