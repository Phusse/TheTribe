using Microsoft.EntityFrameworkCore;
using TheTribe.Application.Interfaces.Repositories;
using TheTribe.Domain.Entities;
using TheTribe.Infrastructure.Persistence;

namespace TheTribe.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }
}
