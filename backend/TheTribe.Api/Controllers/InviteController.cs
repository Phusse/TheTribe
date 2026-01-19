using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Invites;
using TheTribe.Application.Interfaces;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class InviteController : ControllerBase
{
    private readonly IInviteService _inviteService;

    public InviteController(IInviteService inviteService)
    {
        _inviteService = inviteService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var invite = await _inviteService.GenerateInviteAsync(userId);
        return Ok(ApiResponse.Ok(invite, "Invite generated successfully"));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invites = await _inviteService.GetAllInvitesAsync();
        return Ok(ApiResponse.Ok(invites, "Invites retrieved successfully"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Revoke(Guid id)
    {
        await _inviteService.RevokeInviteAsync(id);
        return Ok(ApiResponse.Ok("Invite revoked successfully"));
    }
}
