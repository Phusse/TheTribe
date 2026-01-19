using TheTribe.Application.DTOs.Content;

namespace TheTribe.Application.Interfaces;

public interface IContentService
{
    Task<IEnumerable<TrainingModuleResponse>> GetAllModulesAsync();
    Task<TrainingModuleResponse> CreateModuleAsync(CreateTrainingModuleRequest request, Guid userId);
    
    Task<IEnumerable<LiveSessionResponse>> GetAllSessionsAsync();
    Task<LiveSessionResponse> CreateSessionAsync(CreateLiveSessionRequest request, Guid userId);
}
