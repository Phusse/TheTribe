using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TheTribe.Application.DTOs;
using TheTribe.Application.DTOs.Social;
using TheTribe.Application.Interfaces;
using TheTribe.Application.Interfaces.Repositories;

namespace TheTribe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public UsersController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Get the current user's profile (self)
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));

        var response = new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Bio,
            user.ProfilePhotoUrl,
            user.PhoneNumber,
            user.DateOfBirth,
            user.Location,
            user.Timezone,
            user.Occupation,
            user.IsProfileComplete,
            user.CreatedAt
        );
        return Ok(ApiResponse.Ok(response, "Profile retrieved successfully"));
    }

    /// <summary>
    /// Update the current user's profile
    /// </summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty) return Unauthorized(ApiResponse.Fail("Unauthorized"));

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));

        // Update only provided fields
        if (request.FirstName != null) user.FirstName = request.FirstName;
        if (request.LastName != null) user.LastName = request.LastName;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.ProfilePhotoUrl != null) user.ProfilePhotoUrl = request.ProfilePhotoUrl;
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
        if (request.DateOfBirth != null) user.DateOfBirth = request.DateOfBirth;
        if (request.Location != null) user.Location = request.Location;
        if (request.Timezone != null) user.Timezone = request.Timezone;
        if (request.Occupation != null) user.Occupation = request.Occupation;

        user.ProfileUpdatedAt = DateTime.UtcNow;

        // Check if profile is complete (has key fields filled)
        user.IsProfileComplete = !string.IsNullOrWhiteSpace(user.FirstName) &&
                                  !string.IsNullOrWhiteSpace(user.LastName) &&
                                  !string.IsNullOrWhiteSpace(user.Bio) &&
                                  user.DateOfBirth != null;

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        var response = new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Bio,
            user.ProfilePhotoUrl,
            user.PhoneNumber,
            user.DateOfBirth,
            user.Location,
            user.Timezone,
            user.Occupation,
            user.IsProfileComplete,
            user.CreatedAt
        );

        return Ok(ApiResponse.Ok(response, "Profile updated successfully"));
    }

    /// <summary>
    /// Get any user's profile by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserProfile(Guid id)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));

        var response = new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Bio,
            user.ProfilePhotoUrl,
            user.PhoneNumber,
            user.DateOfBirth,
            user.Location,
            user.Timezone,
            user.Occupation,
            user.IsProfileComplete,
            user.CreatedAt
        );
        return Ok(ApiResponse.Ok(response, "User profile retrieved successfully"));
    }

    [HttpPut("{id}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
    {
        if (!await IsSuperAdmin()) return Forbid();

        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));

        if (!Enum.IsDefined(typeof(Domain.Entities.UserRole), request.Role))
            return BadRequest(ApiResponse.Fail("Invalid Role ID."));

        user.Role = (Domain.Entities.UserRole)request.Role;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return Ok(ApiResponse.Ok(new { userId = user.Id, role = user.Role.ToString() }, $"User role updated to {user.Role}"));
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        if (!await IsSuperAdmin()) return Forbid();
        
        var users = await _unitOfWork.Users.GetAllAsync();
        var response = users.Select(u => new UserAdminResponse(
            u.Id,
            u.FirstName,
            u.LastName,
            u.Email,
            u.Role.ToString(),
            u.IsActive,
            u.IsProfileComplete,
            u.CreatedAt
        ));

        return Ok(ApiResponse.Ok(response, "Users retrieved successfully"));
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        if (!await IsSuperAdmin()) return Forbid();

        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));

        user.IsActive = request.IsActive;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CompleteAsync();

        return Ok(ApiResponse.Ok(new { userId = user.Id, isActive = user.IsActive }, $"User status updated to {(user.IsActive ? "Active" : "Suspended")}"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        if (!await IsSuperAdmin()) return Forbid();

        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) return NotFound(ApiResponse.Fail("User not found"));

        _unitOfWork.Users.Remove(user);
        await _unitOfWork.CompleteAsync();

        return Ok(ApiResponse.Ok("User deleted successfully"));
    }

    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdString != null && Guid.TryParse(userIdString, out var userId) ? userId : Guid.Empty;
    }

    private async Task<bool> IsSuperAdmin()
    {
        var requestorId = GetCurrentUserId();
        if (requestorId == Guid.Empty) return false;

        var requestor = await _unitOfWork.Users.GetByIdAsync(requestorId);
        return requestor != null && requestor.Role == Domain.Entities.UserRole.SuperAdmin;
    }
}
