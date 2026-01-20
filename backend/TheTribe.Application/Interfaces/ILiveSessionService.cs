using TheTribe.Application.DTOs.LiveSession;

namespace TheTribe.Application.Interfaces;

public interface ILiveSessionService
{
    Task<IEnumerable<LiveSessionResponse>> GetAllSessionsAsync();
    Task<LiveSessionResponse?> GetSessionByIdAsync(Guid id);
    Task<LiveSessionResponse> CreateSessionAsync(CreateLiveSessionRequest request, Guid userId);
    Task<LiveSessionResponse?> UpdateSessionAsync(Guid id, UpdateLiveSessionRequest request, Guid userId);
    Task<string?> DeleteSessionAsync(Guid id);  // Returns session title or null if not found
}
