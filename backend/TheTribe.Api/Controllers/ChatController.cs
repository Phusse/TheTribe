using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Chat;
using TheTribe.Application.Interfaces;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    /// <summary>
    /// Get chat message history with optional room filter.
    /// Also returns list of user's rooms for filtering UI.
    /// </summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] Guid? chatRoomId = null)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        try
        {
            var history = await _chatService.GetMessageHistoryAsync(userId, chatRoomId);
            return Ok(ApiResponse.Ok(history, "Chat history retrieved successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
    }

    /// <summary>
    /// Get WhatsApp-style conversations list (DMs + Groups).
    /// Ordered by last message time, with unread counts.
    /// </summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations([FromQuery] string filter = "all")
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var conversationFilter = filter.ToLower() switch
        {
            "unread" => ConversationFilter.Unread,
            "read" => ConversationFilter.Read,
            _ => ConversationFilter.All
        };

        var conversations = await _chatService.GetConversationsAsync(userId, conversationFilter);
        return Ok(ApiResponse.Ok(conversations, "Conversations retrieved successfully"));
    }

    /// <summary>
    /// Mark all messages in a conversation as read.
    /// </summary>
    [HttpPost("mark-read")]
    public async Task<IActionResult> MarkAsRead(MarkReadRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        try
        {
            await _chatService.MarkAsReadAsync(userId, request.ConversationId, request.IsGroup);
            return Ok(ApiResponse.Ok("Messages marked as read"));
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage(SendMessageRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        try
        {
            var response = await _chatService.SaveMessageAsync(request, userId);
            return Ok(ApiResponse.Ok(response, "Message sent successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse.Fail(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.Fail(ex.Message));
        }
    }

    [HttpPost("draft")]
    public async Task<IActionResult> SaveDraft(SaveDraftRequest request)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var result = await _chatService.SaveDraftAsync(request, userId);
        return Ok(ApiResponse.Ok(result, "Draft saved successfully"));
    }

    [HttpGet("draft")]
    public async Task<IActionResult> GetDraft()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty)
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var result = await _chatService.GetDraftAsync(userId);
        if (result == null) return Ok(ApiResponse.Ok((object?)null, "No draft found"));

        return Ok(ApiResponse.Ok(result, "Draft retrieved successfully"));
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userIdString != null && Guid.TryParse(userIdString, out var userId) ? userId : Guid.Empty;
    }
}

