using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheTribe.Application.Interfaces;
using TheTribe.Application.Interfaces.Repositories;
using TheTribe.Infrastructure.Authentication;
using TheTribe.Infrastructure.Persistence;
using TheTribe.Infrastructure.Repositories;

namespace TheTribe.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddTransient<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<TheTribe.Application.Interfaces.IPasswordHasher, PasswordHasher>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!)),
                ValidateIssuer = true,
                ValidIssuer = configuration["JwtSettings:Issuer"],
                ValidateAudience = true,
                ValidAudience = configuration["JwtSettings:Audience"],
                ClockSkew = TimeSpan.Zero
            };

            // Support tokens without "Bearer " prefix + SignalR Auth via Query String
            options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    // 1. Handle SignalR query string token
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                    {
                        context.Token = accessToken;
                        return Task.CompletedTask;
                    }

                    // 2. Handle Authorization header without "Bearer " prefix
                    var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                    if (!string.IsNullOrEmpty(authHeader))
                    {
                        // If token doesn't start with "Bearer ", treat the whole value as the token
                        if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                        {
                            context.Token = authHeader;
                        }
                    }

                    return Task.CompletedTask;
                }
            };
        });

        services.AddSignalR();

        return services;
    }
}
