using TheTribe.Application.DTOs.Chat;
using TheTribe.Application.Interfaces;
using TheTribe.Domain.Entities;

namespace TheTribe.Application.Services;

public class ChatService : IChatService
{
    private readonly IUnitOfWork _unitOfWork;

    public ChatService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ChatHistoryResponse> GetMessageHistoryAsync(Guid userId, Guid? chatRoomId = null)
    {
        // Get user's room memberships
        var memberships = await _unitOfWork.ChatRoomMembers.FindAsync(m => m.UserId == userId);
        var allowedRoomIds = memberships.Select(m => m.ChatRoomId).ToList();

        // Get messages based on filter
        IEnumerable<Message> messages;
        
        if (chatRoomId.HasValue)
        {
            // Filter by specific room
            if (!allowedRoomIds.Contains(chatRoomId.Value))
                throw new UnauthorizedAccessException("You are not a member of this room.");
                
            messages = await _unitOfWork.Messages.FindAsync(m => m.ChatRoomId == chatRoomId.Value);
        }
        else
        {
            // Get all messages user can see
            messages = await _unitOfWork.Messages.FindAsync(m => 
                (m.ChatRoomId == null && m.ReceiverId == null) || // Global
                (m.ReceiverId != null && (m.SenderId == userId || m.ReceiverId == userId)) || // Private DM
                (m.ChatRoomId != null && allowedRoomIds.Contains(m.ChatRoomId.Value)) // Private Room
            );
        }
        
        // Build message responses with room names and receiver names
        var result = new List<MessageResponse>();
        var roomCache = new Dictionary<Guid, string>();
        var userCache = new Dictionary<Guid, string>();
        
        foreach (var msg in messages)
        {
            // Get sender name
            string senderName;
            if (!userCache.TryGetValue(msg.SenderId, out senderName!))
            {
                var sender = await _unitOfWork.Users.GetByIdAsync(msg.SenderId);
                senderName = sender != null ? $"{sender.FirstName} {sender.LastName}" : "Unknown";
                userCache[msg.SenderId] = senderName;
            }
            
            // Get receiver name if applicable
            string? receiverName = null;
            if (msg.ReceiverId.HasValue)
            {
                if (!userCache.TryGetValue(msg.ReceiverId.Value, out receiverName!))
                {
                    var receiver = await _unitOfWork.Users.GetByIdAsync(msg.ReceiverId.Value);
                    receiverName = receiver != null ? $"{receiver.FirstName} {receiver.LastName}" : "Unknown";
                    userCache[msg.ReceiverId.Value] = receiverName;
                }
            }
            
            // Get room name if applicable
            string? roomName = null;
            if (msg.ChatRoomId.HasValue)
            {
                if (!roomCache.TryGetValue(msg.ChatRoomId.Value, out roomName))
                {
                    var room = await _unitOfWork.ChatRooms.GetByIdAsync(msg.ChatRoomId.Value);
                    roomName = room?.Name;
                    if (roomName != null)
                        roomCache[msg.ChatRoomId.Value] = roomName;
                }
            }
            
            result.Add(new MessageResponse(
                msg.Id,
                msg.Content,
                msg.CreatedAt,
                msg.SenderId,
                senderName,
                msg.ReceiverId,
                receiverName,
                msg.ChatRoomId,
                roomName,
                msg.IsRead
            ));
        }

        // Get user's rooms for filtering UI
        var rooms = new List<ChatRoomResponse>();
        foreach (var roomId in allowedRoomIds)
        {
            var room = await _unitOfWork.ChatRooms.GetByIdAsync(roomId);
            if (room != null)
            {
                var creator = await _unitOfWork.Users.GetByIdAsync(room.CreatedByUserId);
                var creatorName = creator != null ? $"{creator.FirstName} {creator.LastName}" : "Unknown";
                rooms.Add(new ChatRoomResponse(room.Id, room.Name, room.Description, room.ProfilePhotoUrl, room.CreatedByUserId, creatorName, room.CreatedAt));
            }
        }

        return new ChatHistoryResponse(
            result.OrderBy(m => m.CreatedAt),
            rooms
        );
    }

    public async Task<MessageResponse> SaveMessageAsync(SendMessageRequest request, Guid senderId)
    {
        string? roomName = null;
        string? receiverName = null;
        
        if (request.ChatRoomId.HasValue)
        {
            // Verify Membership for room messages
            var isMember = (await _unitOfWork.ChatRoomMembers.FindAsync(m => m.ChatRoomId == request.ChatRoomId.Value && m.UserId == senderId)).Any();
            if (!isMember) throw new UnauthorizedAccessException("You are not a member of this room.");
            
            // Get room name
            var room = await _unitOfWork.ChatRooms.GetByIdAsync(request.ChatRoomId.Value);
            roomName = room?.Name;
        }
        else if (request.ReceiverId.HasValue)
        {
            // Verify connection for DM messages
            var connections = await _unitOfWork.Connections.FindAsync(c =>
                c.Status == Domain.Entities.ConnectionStatus.Accepted &&
                ((c.RequesterId == senderId && c.ReceiverId == request.ReceiverId.Value) ||
                 (c.ReceiverId == senderId && c.RequesterId == request.ReceiverId.Value)));
            
            if (!connections.Any())
                throw new UnauthorizedAccessException("You can only send direct messages to users you are connected with.");
            
            // Get receiver name
            var receiver = await _unitOfWork.Users.GetByIdAsync(request.ReceiverId.Value);
            if (receiver == null) throw new KeyNotFoundException("Receiver not found.");
            receiverName = $"{receiver.FirstName} {receiver.LastName}";
        }

        var message = new Message
        {
            Content = request.Content,
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            ChatRoomId = request.ChatRoomId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false // New messages are unread
        };

        await _unitOfWork.Messages.AddAsync(message);
        await _unitOfWork.CompleteAsync();

        var user = await _unitOfWork.Users.GetByIdAsync(senderId);
        var senderName = user != null ? $"{user.FirstName} {user.LastName}" : "Unknown";

        return new MessageResponse(
            message.Id,
            message.Content,
            message.CreatedAt,
            message.SenderId,
            senderName,
            message.ReceiverId,
            receiverName,
            message.ChatRoomId,
            roomName,
            message.IsRead
        );
    }

    public async Task<DraftResponse> SaveDraftAsync(SaveDraftRequest request, Guid userId)
    {
        // Check if draft exists
        // Note: Generic Repository FindAsync returns valid IEnum, we can take first.
        // Assuming FindAsync works on memory or DbQuery.
        // Using "Drafts" DbSet from Entity Framework. 
        
        var drafts = await _unitOfWork.Drafts.FindAsync(d => d.UserId == userId);
        var existingDraft = drafts.FirstOrDefault();

        if (existingDraft != null)
        {
            existingDraft.Content = request.Content;
            existingDraft.LastUpdated = DateTime.UtcNow;
            _unitOfWork.Drafts.Update(existingDraft);
            await _unitOfWork.CompleteAsync();

            return new DraftResponse(existingDraft.Content, existingDraft.LastUpdated);
        }
        else
        {
            var newDraft = new Draft
            {
                UserId = userId,
                Content = request.Content,
                LastUpdated = DateTime.UtcNow
            };
            await _unitOfWork.Drafts.AddAsync(newDraft);
            await _unitOfWork.CompleteAsync();

            return new DraftResponse(newDraft.Content, newDraft.LastUpdated);
        }
    }

    public async Task<DraftResponse?> GetDraftAsync(Guid userId)
    {
        var drafts = await _unitOfWork.Drafts.FindAsync(d => d.UserId == userId);
        var draft = drafts.FirstOrDefault();

        if (draft == null) return null;

        return new DraftResponse(draft.Content, draft.LastUpdated);
    }

    public async Task<IEnumerable<ConversationResponse>> GetConversationsAsync(Guid userId, ConversationFilter filter)
    {
        var conversations = new List<ConversationResponse>();
        
        // 1. Get all DM conversations (messages where user is sender or receiver)
        var allMessages = await _unitOfWork.Messages.GetAllAsync();
        var dmMessages = allMessages.Where(m => 
            m.ChatRoomId == null && m.ReceiverId != null &&
            (m.SenderId == userId || m.ReceiverId == userId)
        ).ToList();

        // Group by the other person in the conversation
        var dmConversations = dmMessages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId!.Value : m.SenderId)
            .ToList();

        foreach (var group in dmConversations)
        {
            var otherUserId = group.Key;
            var otherUser = await _unitOfWork.Users.GetByIdAsync(otherUserId);
            if (otherUser == null) continue;

            var lastMessage = group.OrderByDescending(m => m.CreatedAt).First();
            var unreadCount = group.Count(m => !m.IsRead && m.ReceiverId == userId);

            // Apply filter
            if (filter == ConversationFilter.Unread && unreadCount == 0) continue;
            if (filter == ConversationFilter.Read && unreadCount > 0) continue;

            conversations.Add(new ConversationResponse(
                otherUserId,
                $"{otherUser.FirstName} {otherUser.LastName}",
                otherUser.ProfilePhotoUrl,
                false, // Not a group
                lastMessage.Content.Length > 50 ? lastMessage.Content[..50] + "..." : lastMessage.Content,
                lastMessage.CreatedAt,
                unreadCount,
                unreadCount > 0
            ));
        }

        // 2. Get all group conversations
        var memberships = await _unitOfWork.ChatRoomMembers.FindAsync(m => m.UserId == userId);
        
        foreach (var membership in memberships)
        {
            var room = await _unitOfWork.ChatRooms.GetByIdAsync(membership.ChatRoomId);
            if (room == null) continue;

            var roomMessages = allMessages.Where(m => m.ChatRoomId == membership.ChatRoomId).ToList();
            
            if (!roomMessages.Any())
            {
                // Room with no messages yet - still show it if filter is All
                if (filter == ConversationFilter.All)
                {
                    conversations.Add(new ConversationResponse(
                        room.Id,
                        room.Name,
                        null, // Groups don't have photos
                        true,
                        "No messages yet",
                        room.CreatedAt,
                        0,
                        false
                    ));
                }
                continue;
            }

            var lastMessage = roomMessages.OrderByDescending(m => m.CreatedAt).First();
            var unreadCount = roomMessages.Count(m => !m.IsRead && m.SenderId != userId);

            // Apply filter
            if (filter == ConversationFilter.Unread && unreadCount == 0) continue;
            if (filter == ConversationFilter.Read && unreadCount > 0) continue;

            conversations.Add(new ConversationResponse(
                room.Id,
                room.Name,
                null, // Groups don't have photos
                true,
                lastMessage.Content.Length > 50 ? lastMessage.Content[..50] + "..." : lastMessage.Content,
                lastMessage.CreatedAt,
                unreadCount,
                unreadCount > 0
            ));
        }

        // Order by last message time, most recent first
        return conversations.OrderByDescending(c => c.LastMessageAt);
    }

    public async Task MarkAsReadAsync(Guid userId, Guid conversationId, bool isGroup)
    {
        IEnumerable<Message> messagesToMark;
        
        if (isGroup)
        {
            // Verify membership
            var isMember = (await _unitOfWork.ChatRoomMembers.FindAsync(m => 
                m.ChatRoomId == conversationId && m.UserId == userId)).Any();
            if (!isMember) throw new UnauthorizedAccessException("You are not a member of this room.");

            // Get all unread messages in the room that aren't from the user
            messagesToMark = await _unitOfWork.Messages.FindAsync(m => 
                m.ChatRoomId == conversationId && !m.IsRead && m.SenderId != userId);
        }
        else
        {
            // Get all unread messages from this person to the user
            messagesToMark = await _unitOfWork.Messages.FindAsync(m => 
                m.ReceiverId == userId && m.SenderId == conversationId && !m.IsRead);
        }

        var now = DateTime.UtcNow;
        foreach (var message in messagesToMark)
        {
            message.IsRead = true;
            message.ReadAt = now;
            _unitOfWork.Messages.Update(message);
        }

        await _unitOfWork.CompleteAsync();
    }
}
