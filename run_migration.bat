dotnet ef migrations add AddChatRooms --project backend/TheTribe.Infrastructure --startup-project backend/TheTribe.Api --output-dir Migrations
dotnet ef database update --project backend/TheTribe.Infrastructure --startup-project backend/TheTribe.Api
