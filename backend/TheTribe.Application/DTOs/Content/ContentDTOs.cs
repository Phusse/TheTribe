namespace TheTribe.Application.DTOs.Content;

public record CreateTrainingModuleRequest(string Title, string Description, string VideoUrl, string ThumbnailUrl, bool IsPublished);
public record TrainingModuleResponse(Guid Id, string Title, string Description, string VideoUrl, string ThumbnailUrl, bool IsPublished, DateTime CreatedAt);

public record CreateLiveSessionRequest(string Title, string Description, DateTime ScheduledAt, string MeetingUrl);
public record LiveSessionResponse(Guid Id, string Title, string Description, DateTime ScheduledAt, string MeetingUrl, DateTime CreatedAt);
