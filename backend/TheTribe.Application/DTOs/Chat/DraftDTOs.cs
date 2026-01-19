using System.ComponentModel.DataAnnotations;

namespace TheTribe.Application.DTOs.Chat;

public record SaveDraftRequest(
    [Required] string Content
);

public record DraftResponse(
    string Content,
    DateTime LastUpdated
);
