using System.ComponentModel.DataAnnotations;

namespace TheTribe.Application.DTOs.Chat;

public record CreateChatRoomRequest(
    [Required] string Name,
    string Description,
    string? ProfilePhotoUrl  // Optional group profile picture
);

public record AddMemberRequest(
    [Required] Guid UserId
);

public record ChatRoomResponse(
    Guid Id,
    string Name,
    string Description,
    string? ProfilePhotoUrl,
    Guid CreatedByUserId,
    string CreatedByName,  // Name of who created the group
    DateTime CreatedAt
);

public record AddMemberResponse(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    DateTime JoinedAt
);

// Response for listing room members
public record RoomMemberResponse(
    Guid UserId,
    string FirstName,
    string LastName,
    string? ProfilePhotoUrl,
    string Role,
    DateTime JoinedAt
);
