using TheTribe.Application.DTOs.Chat;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Interfaces;

public interface IChatRoomService
{
    Task<ChatRoomResponse> CreateRoomAsync(CreateChatRoomRequest request, Guid adminUserId);
    Task<IEnumerable<ChatRoomResponse>> GetMyRoomsAsync(Guid userId);
    Task<AddMemberResponse> AddMemberAsync(Guid chatRoomId, Guid userId, Guid adminUserId);
    Task<IEnumerable<RoomMemberResponse>> GetMembersAsync(Guid chatRoomId, Guid requestingUserId);
    Task<bool> IsMemberAsync(Guid chatRoomId, Guid userId);
    Task<ChatRoomResponse> GetRoomAsync(Guid chatRoomId, Guid requestingUserId);
}
