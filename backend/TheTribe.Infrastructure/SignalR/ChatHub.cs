using Microsoft.AspNetCore.SignalR;
using TheTribe.Application.DTOs.Chat;
using TheTribe.Application.Interfaces;

namespace TheTribe.Infrastructure.SignalR;

public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task SendMessage(SendMessageRequest request)
    {
        // ... (Auth Logic) ...
        var userIdString = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
             // Try getting from claims if UserIdentifier is not set
            var subClaim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (subClaim != null && Guid.TryParse(subClaim.Value, out var subId))
            {
                userId = subId;
            }
            else 
            {
                 throw new HubException("Unauthorized");
            }
        }

        var messageResponse = await _chatService.SaveMessageAsync(request, userId);

        if (request.ChatRoomId.HasValue)
        {
            // Room Message: Send to Group
            await Clients.Group(request.ChatRoomId.Value.ToString()).SendAsync("ReceiveMessage", messageResponse);
        }
        else if (request.ReceiverId.HasValue)
        {
            // Private Message: Send to Sender and Receiver
            await Clients.User(userIdString).SendAsync("ReceiveMessage", messageResponse);
            await Clients.User(request.ReceiverId.Value.ToString()).SendAsync("ReceiveMessage", messageResponse);
        }
        else
        {
            // Global Group Chat: Broadcast to all
            await Clients.All.SendAsync("ReceiveMessage", messageResponse);
        }
    }

    public async Task JoinRoom(Guid chatRoomId)
    {
        // Add current connection to the SignalR group for this Room
        await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId.ToString());
    }

    public async Task SendPrivateMessage(Guid toUserId, string message)
    {
         // Legacy wrapper if needed, or just use SendMessage with ReceiverId
         var request = new SendMessageRequest(message, toUserId, null);
         await SendMessage(request);
    }
}
