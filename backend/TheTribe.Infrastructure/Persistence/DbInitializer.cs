using TheTribe.Application.DTOs.Auth;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;

namespace TheTribe.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(IUnitOfWork unitOfWork, IAuthService authService)
    {
        // Simple check: if any users, do nothing
        var users = await unitOfWork.Users.GetAllAsync();
        if (users.Any()) return;

        // Create Super Admin
        var adminReq = new RegisterRequest(
            "SUPER_ADMIN_SEED",
            "superadmin@tribe.com", 
            "Password123!",
            "Super", 
            "Admin"
        );

        var response = await authService.RegisterAsync(adminReq);

        // Elevate
        var user = await unitOfWork.Users.GetByIdAsync(response.Id);
        if (user != null)
        {
            user.Role = UserRole.SuperAdmin;
            unitOfWork.Users.Update(user);
            await unitOfWork.CompleteAsync();
        }
    }
}
