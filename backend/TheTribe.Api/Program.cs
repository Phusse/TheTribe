using TheTribe.Application;
using TheTribe.Infrastructure;
using TheTribe.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowNextJs");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TheTribe.Infrastructure.SignalR.ChatHub>("/chatHub");

// Seed Database
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var services = scope.ServiceProvider;
        var unitOfWork = services.GetRequiredService<IUnitOfWork>();
        var authService = services.GetRequiredService<IAuthService>();
        await TheTribe.Infrastructure.Persistence.DbInitializer.SeedAsync(unitOfWork, authService);
    }
    catch (Exception)
    {
        // Log error or ignore for MVP
    }
}

app.Run();
