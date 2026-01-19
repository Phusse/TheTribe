using TheTribe.Application.DTOs.Chat;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services;

public class ChatRoomService : IChatRoomService
{
    private readonly IUnitOfWork _unitOfWork;

    public ChatRoomService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ChatRoomResponse> CreateRoomAsync(CreateChatRoomRequest request, Guid adminUserId)
    {
        // 1. Verify Creator is Admin
        var admin = await _unitOfWork.Users.GetByIdAsync(adminUserId);
        if (admin == null || admin.Role == UserRole.Member) 
            throw new UnauthorizedAccessException("Only Admins can create rooms.");

        // 2. Create Room
        var room = new ChatRoom
        {
            Name = request.Name,
            Description = request.Description ?? "",
            ProfilePhotoUrl = request.ProfilePhotoUrl,
            CreatedByUserId = adminUserId,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.ChatRooms.AddAsync(room);
        await _unitOfWork.CompleteAsync();

        // 3. Auto-add Creator as Member
        var membership = new ChatRoomMember
        {
            ChatRoomId = room.Id,
            UserId = adminUserId,
            JoinedAt = DateTime.UtcNow
        };
        await _unitOfWork.ChatRoomMembers.AddAsync(membership);

        // 4. Auto-add SuperAdmin to every room (if not the creator)
        var allUsers = await _unitOfWork.Users.GetAllAsync();
        var superAdmin = allUsers.FirstOrDefault(u => u.Role == UserRole.SuperAdmin);
        
        if (superAdmin != null && superAdmin.Id != adminUserId)
        {
            var superAdminMembership = new ChatRoomMember
            {
                ChatRoomId = room.Id,
                UserId = superAdmin.Id,
                JoinedAt = DateTime.UtcNow
            };
            await _unitOfWork.ChatRoomMembers.AddAsync(superAdminMembership);
        }
        
        await _unitOfWork.CompleteAsync();

        var creatorName = $"{admin.FirstName} {admin.LastName}";
        return new ChatRoomResponse(room.Id, room.Name, room.Description, room.ProfilePhotoUrl, room.CreatedByUserId, creatorName, room.CreatedAt);
    }

    public async Task<IEnumerable<ChatRoomResponse>> GetMyRoomsAsync(Guid userId)
    {
        // Get all memberships for this user
        var memberships = await _unitOfWork.ChatRoomMembers.FindAsync(m => m.UserId == userId);
        
        // Since GenericRepo might not support Include/Join easily without custom methods,
        // we'll fetch rooms by ID. Ideally, use a custom repository method for this JOIN.
        var roomIds = memberships.Select(m => m.ChatRoomId).ToList();
        
        var result = new List<ChatRoomResponse>();
        foreach(var id in roomIds)
        {
            var room = await _unitOfWork.ChatRooms.GetByIdAsync(id);
            if (room != null)
            {
                var creator = await _unitOfWork.Users.GetByIdAsync(room.CreatedByUserId);
                var creatorName = creator != null ? $"{creator.FirstName} {creator.LastName}" : "Unknown";
                result.Add(new ChatRoomResponse(room.Id, room.Name, room.Description, room.ProfilePhotoUrl, room.CreatedByUserId, creatorName, room.CreatedAt));
            }
        }

        return result;
    }

    public async Task<AddMemberResponse> AddMemberAsync(Guid chatRoomId, Guid userId, Guid adminUserId)
    {
        // Prevent self-add
        if (adminUserId == userId)
            throw new InvalidOperationException("You cannot add yourself to a group.");

        // Verify Admin
        var admin = await _unitOfWork.Users.GetByIdAsync(adminUserId);
        if (admin == null || admin.Role == UserRole.Member) 
            throw new UnauthorizedAccessException("Only Admins can add members.");

        // Verify Room Exists
        var room = await _unitOfWork.ChatRooms.GetByIdAsync(chatRoomId);
        if (room == null) throw new KeyNotFoundException("Room not found.");

        // Get user to be added
        var userToAdd = await _unitOfWork.Users.GetByIdAsync(userId);
        if (userToAdd == null) throw new KeyNotFoundException("User not found.");

        // Check if already member
        var existing = await _unitOfWork.ChatRoomMembers.FindAsync(m => m.ChatRoomId == chatRoomId && m.UserId == userId);
        if (existing.Any()) 
            throw new InvalidOperationException("User is already a member of this group.");

        // Add
        var joinedAt = DateTime.UtcNow;
        var membership = new ChatRoomMember
        {
            ChatRoomId = chatRoomId,
            UserId = userId,
            JoinedAt = joinedAt
        };
        await _unitOfWork.ChatRoomMembers.AddAsync(membership);
        await _unitOfWork.CompleteAsync();

        return new AddMemberResponse(
            userToAdd.Id,
            userToAdd.FirstName,
            userToAdd.LastName,
            userToAdd.Email,
            userToAdd.Role.ToString(),
            joinedAt
        );
    }

    public async Task<IEnumerable<RoomMemberResponse>> GetMembersAsync(Guid chatRoomId, Guid requestingUserId)
    {
        // Verify the requesting user is a member of the room
        var isMember = await IsMemberAsync(chatRoomId, requestingUserId);
        if (!isMember)
            throw new UnauthorizedAccessException("You are not a member of this room.");

        // Verify room exists
        var room = await _unitOfWork.ChatRooms.GetByIdAsync(chatRoomId);
        if (room == null) throw new KeyNotFoundException("Room not found.");

        // Get all memberships for this room
        var memberships = await _unitOfWork.ChatRoomMembers.FindAsync(m => m.ChatRoomId == chatRoomId);
        
        var members = new List<RoomMemberResponse>();
        foreach (var membership in memberships)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(membership.UserId);
            if (user != null)
            {
                members.Add(new RoomMemberResponse(
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.ProfilePhotoUrl,
                    user.Role.ToString(),
                    membership.JoinedAt
                ));
            }
        }

        return members.OrderBy(m => m.JoinedAt);
    }

    public async Task<bool> IsMemberAsync(Guid chatRoomId, Guid userId)
    {
        var membership = await _unitOfWork.ChatRoomMembers.FindAsync(m => m.ChatRoomId == chatRoomId && m.UserId == userId);
        return membership.Any();
    }
}
