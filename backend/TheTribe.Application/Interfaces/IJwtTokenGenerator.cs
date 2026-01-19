using TheTribe.Domain.Entities;

namespace TheTribe.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
}
