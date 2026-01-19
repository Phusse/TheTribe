using TheTribe.Application.DTOs.Content;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services;

public class ContentService : IContentService
{
    private readonly IUnitOfWork _unitOfWork;

    public ContentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TrainingModuleResponse>> GetAllModulesAsync()
    {
        var modules = await _unitOfWork.TrainingModules.GetAllAsync();
        return modules.Select(m => new TrainingModuleResponse(m.Id, m.Title, m.Description, m.VideoUrl, m.ThumbnailUrl, m.IsPublished, m.CreatedAt));
    }

    public async Task<TrainingModuleResponse> CreateModuleAsync(CreateTrainingModuleRequest request, Guid userId)
    {
        var module = new TrainingModule
        {
            Title = request.Title,
            Description = request.Description,
            VideoUrl = request.VideoUrl,
            ThumbnailUrl = request.ThumbnailUrl,
            IsPublished = request.IsPublished,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.TrainingModules.AddAsync(module);
        await _unitOfWork.CompleteAsync();

        return new TrainingModuleResponse(module.Id, module.Title, module.Description, module.VideoUrl, module.ThumbnailUrl, module.IsPublished, module.CreatedAt);
    }

    public async Task<IEnumerable<LiveSessionResponse>> GetAllSessionsAsync()
    {
        var sessions = await _unitOfWork.LiveSessions.GetAllAsync();
        // Sort by ScheduledAt desc? Or asc for upcoming?
        return sessions.OrderByDescending(s => s.ScheduledAt).Select(s => new LiveSessionResponse(s.Id, s.Title, s.Description, s.ScheduledAt, s.MeetingUrl, s.CreatedAt));
    }

    public async Task<LiveSessionResponse> CreateSessionAsync(CreateLiveSessionRequest request, Guid userId)
    {
        var session = new LiveSession
        {
            Title = request.Title,
            Description = request.Description,
            ScheduledAt = request.ScheduledAt,
            MeetingUrl = request.MeetingUrl,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.LiveSessions.AddAsync(session);
        await _unitOfWork.CompleteAsync();

        return new LiveSessionResponse(session.Id, session.Title, session.Description, session.ScheduledAt, session.MeetingUrl, session.CreatedAt);
    }
}
