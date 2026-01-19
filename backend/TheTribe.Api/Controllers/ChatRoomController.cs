using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Chat;
using TheTribe.Application.Interfaces;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatRoomController : ControllerBase
{
    private readonly IChatRoomService _chatRoomService;

    public ChatRoomController(IChatRoomService chatRoomService)
    {
        _chatRoomService = chatRoomService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoom(CreateChatRoomRequest request)
    {
        var userId = GetUserId();
        try 
        {
            var result = await _chatRoomService.CreateRoomAsync(request, userId);
            return Ok(ApiResponse.Ok(result, "Chat room created successfully"));
        }
        catch (UnauthorizedAccessException ex) 
        { 
            return Forbid(); 
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRooms()
    {
        var userId = GetUserId();
        var result = await _chatRoomService.GetMyRoomsAsync(userId);
        return Ok(ApiResponse.Ok(result, "Chat rooms retrieved successfully"));
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(Guid id, AddMemberRequest request)
    {
        var adminId = GetUserId();
        try
        {
            var result = await _chatRoomService.AddMemberAsync(id, request.UserId, adminId);
            return Ok(ApiResponse.Ok(result, "Member added successfully"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse.Fail(ex.Message));
        }
        catch (UnauthorizedAccessException ex) 
        { 
            return Forbid(); 
        }
        catch (KeyNotFoundException ex) 
        { 
            return NotFound(ApiResponse.Fail(ex.Message)); 
        }
    }

    /// <summary>
    /// Get all members of a chat room
    /// </summary>
    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        var userId = GetUserId();
        try
        {
            var members = await _chatRoomService.GetMembersAsync(id, userId);
            return Ok(ApiResponse.Ok(members, "Members retrieved successfully"));
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

    private Guid GetUserId()
    {
        var id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return id != null ? Guid.Parse(id) : Guid.Empty;
    }
}

