using System.ComponentModel.DataAnnotations;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.DTOs.Social;

// Profiles
public record UserProfileResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string? Bio,
    string? ProfilePhotoUrl,
    string? PhoneNumber,
    DateTime? DateOfBirth,
    string? Location,
    string? Timezone,
    string? Occupation,
    bool IsProfileComplete,
    DateTime CreatedAt
);

public record UpdateProfileRequest(
    string? FirstName,
    string? LastName,
    string? Bio,
    string? ProfilePhotoUrl,
    string? PhoneNumber,
    DateTime? DateOfBirth,
    string? Location,
    string? Timezone,
    string? Occupation
);

// Connections
public record ConnectionRequest(
    [Required] Guid TargetUserId
);

public record UpdateConnectionStatusRequest(
    [Required] ConnectionStatus Status
);

public record ConnectionResponse(
    Guid Id,
    Guid RequesterId,
    string RequesterName,
    Guid ReceiverId,
    string ReceiverName,
    ConnectionStatus Status,
    DateTime CreatedAt
);

public record UpdateRoleRequest(
    [Required] int Role
);

public record UpdateUserStatusRequest(
    [Required] bool IsActive
);

public record UserAdminResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    bool IsActive,
    bool IsProfileComplete,
    DateTime CreatedAt
);

