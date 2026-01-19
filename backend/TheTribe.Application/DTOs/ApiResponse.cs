namespace TheTribe.Application.DTOs;

/// <summary>
/// Standard API response wrapper for consistent response format
/// </summary>
public record ApiResponse<T>
{
    public string Message { get; init; } = "Success";
    public T? Data { get; init; }
    public bool Success { get; init; } = true;

    public static ApiResponse<T> Ok(T data, string message = "Success") => new()
    {
        Message = message,
        Data = data,
        Success = true
    };

    public static ApiResponse<T> Fail(string message) => new()
    {
        Message = message,
        Data = default,
        Success = false
    };
}

/// <summary>
/// Non-generic version for responses without data
/// </summary>
public record ApiResponse
{
    public string Message { get; init; } = "Success";
    public object? Data { get; init; }
    public bool Success { get; init; } = true;

    public static ApiResponse Ok(string message = "Success") => new()
    {
        Message = message,
        Success = true
    };

    public static ApiResponse Ok(object data, string message = "Success") => new()
    {
        Message = message,
        Data = data,
        Success = true
    };

    public static ApiResponse Fail(string message) => new()
    {
        Message = message,
        Success = false
    };
}
