using Microsoft.Extensions.DependencyInjection;

namespace TheTribe.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<TheTribe.Application.Interfaces.IAuthService, TheTribe.Application.Services.AuthService>();
        services.AddScoped<TheTribe.Application.Interfaces.IContentService, TheTribe.Application.Services.ContentService>();
        services.AddScoped<TheTribe.Application.Interfaces.IInviteService, TheTribe.Application.Services.InviteService>();
        services.AddScoped<TheTribe.Application.Interfaces.ILiveSessionService, TheTribe.Application.Services.LiveSessionService>();
        services.AddScoped<TheTribe.Application.Interfaces.IChatService, TheTribe.Application.Services.ChatService>();
        services.AddScoped<TheTribe.Application.Interfaces.Social.IConnectionService, TheTribe.Application.Services.Social.ConnectionService>();
        services.AddScoped<TheTribe.Application.Interfaces.IChatRoomService, TheTribe.Application.Services.ChatRoomService>();
        return services;
    }
}
