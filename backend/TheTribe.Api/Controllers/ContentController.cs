using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Content;
using TheTribe.Application.Interfaces;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContentController : ControllerBase
{
    private readonly IContentService _contentService;

    public ContentController(IContentService contentService)
    {
        _contentService = contentService;
    }

    [HttpGet("modules")]
    public async Task<IActionResult> GetModules()
    {
        var modules = await _contentService.GetAllModulesAsync();
        return Ok(ApiResponse.Ok(modules, "Training modules retrieved successfully"));
    }

    [HttpPost("modules")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateModule(CreateTrainingModuleRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var module = await _contentService.CreateModuleAsync(request, userId);
        return Ok(ApiResponse.Ok(module, "Training module created successfully"));
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        var sessions = await _contentService.GetAllSessionsAsync();
        return Ok(ApiResponse.Ok(sessions, "Live sessions retrieved successfully"));
    }

    [HttpPost("sessions")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateSession(CreateLiveSessionRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var session = await _contentService.CreateSessionAsync(request, userId);
        return Ok(ApiResponse.Ok(session, "Live session created successfully"));
    }
}
