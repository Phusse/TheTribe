using Microsoft.AspNetCore.Mvc;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Auth;
using TheTribe.Application.Interfaces;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(ApiResponse<AuthResponse>.Ok(response, "Login successful"));
        }
        catch (Exception ex)
        {
            return Unauthorized(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(ApiResponse<AuthResponse>.Ok(response, "Registration successful"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<AuthResponse>.Fail(ex.Message));
        }
    }

    /// <summary>
    /// ONE-TIME FIX: Regenerates the super admin password hash.
    /// Call this endpoint once if the super admin login fails due to corrupted password hash.
    /// Remove this endpoint after use in production.
    /// </summary>
    [HttpPost("fix-superadmin")]
    public async Task<ActionResult<ApiResponse<string>>> FixSuperAdmin()
    {
        try
        {
            var result = await _authService.FixSuperAdminPasswordAsync();
            return Ok(ApiResponse<string>.Ok(result, "Fix applied successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.Fail(ex.Message));
        }
    }
}
