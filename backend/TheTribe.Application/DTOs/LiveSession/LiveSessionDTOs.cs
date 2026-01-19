using System.ComponentModel.DataAnnotations;

namespace TheTribe.Application.DTOs.LiveSession;

public record CreateLiveSessionRequest(
    [Required] string Title, 
    string Description, 
    [Required] DateTime ScheduledAt,
    string MeetingUrl
);

public record UpdateLiveSessionRequest(
    string Title, 
    string Description, 
    DateTime ScheduledAt,
    string MeetingUrl
);

public record LiveSessionResponse(
    Guid Id,
    string Title,
    string Description,
    DateTime ScheduledAt,
    string MeetingUrl,
    DateTime CreatedAt,
    Guid? CreatedByUserId,
    string CreatedByUserName
);
