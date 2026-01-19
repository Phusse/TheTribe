using TheTribe.Application.DTOs.Chat;

namespace TheTribe.Application.Interfaces;

public interface IChatService
{
    // Message history with optional room filter
    Task<ChatHistoryResponse> GetMessageHistoryAsync(Guid userId, Guid? chatRoomId = null);
    Task<MessageResponse> SaveMessageAsync(SendMessageRequest request, Guid senderId);

    // Conversations list (WhatsApp-style)
    Task<IEnumerable<ConversationResponse>> GetConversationsAsync(Guid userId, ConversationFilter filter);
    Task MarkAsReadAsync(Guid userId, Guid conversationId, bool isGroup);

    // Drafts
    Task<DraftResponse> SaveDraftAsync(SaveDraftRequest request, Guid userId);
    Task<DraftResponse?> GetDraftAsync(Guid userId);
}
