using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Social;
using TheTribe.Application.Interfaces.Social;
using TheTribe.Domain.Entities;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConnectionController : ControllerBase
{
    private readonly IConnectionService _connectionService;

    public ConnectionController(IConnectionService connectionService)
    {
        _connectionService = connectionService;
    }

    [HttpPost("request")]
    public async Task<IActionResult> SendRequest(ConnectionRequest request)
    {
        var userId = GetUserId();
        try
        {
            var result = await _connectionService.SendRequestAsync(userId, request.TargetUserId);
            return Ok(ApiResponse.Ok(result, "Connection request sent successfully"));
        }
        catch (ArgumentException ex) 
        { 
            return BadRequest(ApiResponse.Fail(ex.Message)); 
        }
        catch (InvalidOperationException ex) 
        { 
            return Conflict(ApiResponse.Fail(ex.Message)); 
        }
    }

    [HttpPut("{id}/respond")]
    public async Task<IActionResult> Respond(Guid id, UpdateConnectionStatusRequest request)
    {
        var userId = GetUserId();
        try
        {
            var result = await _connectionService.UpdateStatusAsync(userId, id, request.Status);
            return Ok(ApiResponse.Ok(result, "Connection status updated successfully"));
        }
        catch (KeyNotFoundException) 
        { 
            return NotFound(ApiResponse.Fail("Connection not found")); 
        }
        catch (UnauthorizedAccessException) 
        { 
            return Forbid(); 
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetConnections()
    {
        var userId = GetUserId();
        var result = await _connectionService.GetConnectionsAsync(userId);
        return Ok(ApiResponse.Ok(result, "Connections retrieved successfully"));
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var userId = GetUserId();
        var result = await _connectionService.GetPendingRequestsAsync(userId);
        return Ok(ApiResponse.Ok(result, "Pending requests retrieved successfully"));
    }

    private Guid GetUserId()
    {
        var id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return id != null ? Guid.Parse(id) : Guid.Empty;
    }
}
