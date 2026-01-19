using System.ComponentModel.DataAnnotations;

namespace TheTribe.Application.DTOs.Chat;

public record SendMessageRequest(
    [Required] string Content,
    Guid? ReceiverId,
    Guid? ChatRoomId
);

public record MessageResponse(
    Guid Id,
    string Content,
    DateTime CreatedAt,
    Guid SenderId,
    string SenderName,
    Guid? ReceiverId,
    string? ReceiverName,
    Guid? ChatRoomId,
    string? ChatRoomName,
    bool IsRead
);

// Represents a conversation (person or group) in the chat list
public record ConversationResponse(
    Guid Id,
    string Name,
    string? ProfilePhotoUrl,
    bool IsGroup,
    string LastMessage,
    DateTime LastMessageAt,
    int UnreadCount,
    bool HasUnread
);

// Filter options for conversations
public enum ConversationFilter { All, Unread, Read }

// Request to mark messages as read
public record MarkReadRequest(
    [Required] Guid ConversationId,
    bool IsGroup
);

// History response with rooms list
public record ChatHistoryResponse(
    IEnumerable<MessageResponse> Messages,
    IEnumerable<ChatRoomResponse> MyRooms
);
