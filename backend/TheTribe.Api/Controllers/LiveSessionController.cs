using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.LiveSession;
using TheTribe.Application.Interfaces;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LiveSessionController : ControllerBase
{
    private readonly ILiveSessionService _sessionService;

    public LiveSessionController(ILiveSessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sessions = await _sessionService.GetAllSessionsAsync();
        return Ok(ApiResponse.Ok(sessions, "Live sessions retrieved successfully"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var session = await _sessionService.GetSessionByIdAsync(id);
        if (session == null) return NotFound(ApiResponse.Fail("Session not found"));
        return Ok(ApiResponse.Ok(session, "Live session retrieved successfully"));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateLiveSessionRequest request)
    {
        var userIdString = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdString == null || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var session = await _sessionService.CreateSessionAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = session.Id }, ApiResponse.Ok(session, "Live session created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateLiveSessionRequest request)
    {
        var userIdString = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdString == null || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var session = await _sessionService.UpdateSessionAsync(id, request, userId);
        if (session == null) return NotFound(ApiResponse.Fail("Session not found"));
        
        return Ok(ApiResponse.Ok(session, "Live session updated successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var title = await _sessionService.DeleteSessionAsync(id);
        if (title == null) return NotFound(ApiResponse.Fail("Session not found"));
        return Ok(ApiResponse.Ok($"Live session '{title}' deleted successfully"));
    }
}
