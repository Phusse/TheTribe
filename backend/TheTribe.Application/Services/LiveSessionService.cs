using TheTribe.Application.DTOs.LiveSession;
using TheTribe.Application.Interfaces;
using TheTribe.Application.Interfaces.Repositories;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services;

public class LiveSessionService : ILiveSessionService
{
    private readonly IUnitOfWork _unitOfWork;

    public LiveSessionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<LiveSessionResponse>> GetAllSessionsAsync()
    {
        var sessions = await _unitOfWork.LiveSessions.GetAllAsync();
        
        var result = new List<LiveSessionResponse>();
        foreach (var session in sessions)
        {
            string userName = "Unknown";
            if (session.CreatedByUser != null)
            {
                userName = $"{session.CreatedByUser.FirstName} {session.CreatedByUser.LastName}";
            }
            else if (session.CreatedByUserId.HasValue)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(session.CreatedByUserId.Value);
                if (user != null)
                {
                    userName = $"{user.FirstName} {user.LastName}";
                }
            }

            result.Add(new LiveSessionResponse(
                session.Id,
                session.Title,
                session.Description,
                session.ScheduledAt,
                session.MeetingUrl,
                session.CreatedAt,
                session.CreatedByUserId,
                userName
            ));
        }
        
        return result.OrderByDescending(s => s.ScheduledAt);
    }

    public async Task<LiveSessionResponse?> GetSessionByIdAsync(Guid id)
    {
        var session = await _unitOfWork.LiveSessions.GetByIdAsync(id);
        if (session == null) return null;

        string userName = "Unknown";
        if (session.CreatedByUserId.HasValue)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(session.CreatedByUserId.Value);
            if (user != null)
            {
                userName = $"{user.FirstName} {user.LastName}";
            }
        }

        return new LiveSessionResponse(
            session.Id,
            session.Title,
            session.Description,
            session.ScheduledAt,
            session.MeetingUrl,
            session.CreatedAt,
            session.CreatedByUserId,
            userName
        );
    }

    public async Task<LiveSessionResponse> CreateSessionAsync(CreateLiveSessionRequest request, Guid userId)
    {
        var session = new LiveSession
        {
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            ScheduledAt = request.ScheduledAt,
            MeetingUrl = request.MeetingUrl ?? string.Empty,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.LiveSessions.AddAsync(session);
        await _unitOfWork.CompleteAsync();

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        var userName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown";

        return new LiveSessionResponse(
            session.Id,
            session.Title,
            session.Description,
            session.ScheduledAt,
            session.MeetingUrl,
            session.CreatedAt,
            session.CreatedByUserId,
            userName
        );
    }

    public async Task<LiveSessionResponse?> UpdateSessionAsync(Guid id, UpdateLiveSessionRequest request, Guid userId)
    {
        var session = await _unitOfWork.LiveSessions.GetByIdAsync(id);
        if (session == null) return null;

        // Optional: Check if user has permission to update
        
        if (request.Title != null) session.Title = request.Title;
        if (request.Description != null) session.Description = request.Description;
        if (request.ScheduledAt != default) session.ScheduledAt = request.ScheduledAt;
        if (request.MeetingUrl != null) session.MeetingUrl = request.MeetingUrl;

        _unitOfWork.LiveSessions.Update(session);
        await _unitOfWork.CompleteAsync();

        string userName = "Unknown";
        if (session.CreatedByUserId.HasValue)
        {
             var user = await _unitOfWork.Users.GetByIdAsync(session.CreatedByUserId.Value);
             if (user != null) userName = $"{user.FirstName} {user.LastName}";
        }

        return new LiveSessionResponse(
            session.Id,
            session.Title,
            session.Description,
            session.ScheduledAt,
            session.MeetingUrl,
            session.CreatedAt,
            session.CreatedByUserId,
            userName
        );
    }

    public async Task<bool> DeleteSessionAsync(Guid id)
    {
        var session = await _unitOfWork.LiveSessions.GetByIdAsync(id);
        if (session == null) return false;

        _unitOfWork.LiveSessions.Remove(session);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
