# TheTribe API Documentation

A private men's mentorship platform API built with .NET 8 Clean Architecture.

## Base URL
```
http://localhost:5290
```

## Authentication
All endpoints except `/api/auth/login` and `/api/auth/register` require a JWT Bearer token.

```http
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login with email/password |
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/fix-superadmin` | ❌ | Fix corrupted super admin password (dev only) |

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@tribe.com",
    "password": "Password123!"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@tribe.com",
    "password": "Password123!",
    "inviteCode": "OPTIONAL_INVITE_CODE"
}
```

---

### 👥 Users (`/api/Users`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/me` | ✅ | Any | Get your own profile |
| PUT | `/me` | ✅ | Any | Update your profile |
| GET | `/{id}` | ✅ | Any | Get user profile by ID |
| GET | `/` | ✅ | SuperAdmin | List all users |
| PUT | `/{id}/role` | ✅ | SuperAdmin | Update user role |
| PUT | `/{id}/status` | ✅ | SuperAdmin | Suspend/activate user |
| DELETE | `/{id}` | ✅ | SuperAdmin | Delete user |

#### Update Profile
```http
PUT /api/Users/me
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "bio": "Software Developer",
    "phoneNumber": "+1234567890",
    "location": "New York",
    "occupation": "Developer",
    "dateOfBirth": "1990-01-15"
}
```

#### Update User Role (SuperAdmin only)
```http
PUT /api/Users/{userId}/role
Authorization: Bearer {{superAdminToken}}
Content-Type: application/json

{
    "role": 1
}
```
> Roles: 0 = Member, 1 = Admin, 2 = SuperAdmin

---

### 💬 Chat (`/api/Chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/history?chatRoomId={optional}` | ✅ | Get message history (optionally filter by room) |
| GET | `/conversations?filter={all\|unread\|read}` | ✅ | WhatsApp-style conversation list |
| POST | `/send` | ✅ | Send a message |
| POST | `/mark-read` | ✅ | Mark conversation as read |
| GET | `/draft` | ✅ | Get saved draft |
| POST | `/draft` | ✅ | Save draft |

#### Get Conversations (WhatsApp-style)
```http
GET /api/Chat/conversations?filter=unread
Authorization: Bearer {{token}}
```

#### Send Message (Global)
```http
POST /api/Chat/send
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "content": "Hello everyone!"
}
```

#### Send Private Message
```http
POST /api/Chat/send
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "content": "Hey Bob!",
    "receiverId": "{{userId}}"
}
```

#### Send Room Message
```http
POST /api/Chat/send
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "content": "Hello group!",
    "chatRoomId": "{{roomId}}"
}
```

#### Mark as Read
```http
POST /api/Chat/mark-read
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "conversationId": "{{userIdOrRoomId}}",
    "isGroup": false
}
```

---

### 🏠 Chat Rooms (`/api/ChatRoom`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/` | ✅ | Admin+ | Create chat room |
| GET | `/` | ✅ | Any | Get rooms you're a member of |
| POST | `/{id}/members` | ✅ | Admin+ | Add member to room |

#### Create Room
```http
POST /api/ChatRoom
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "name": "Strategy Room",
    "description": "For strategic discussions"
}
```

#### Add Member
```http
POST /api/ChatRoom/{roomId}/members
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
    "userId": "{{userIdToAdd}}"
}
```

---

### 🤝 Connections (`/api/Connection`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request` | ✅ | Send connection request |
| PUT | `/{id}/respond` | ✅ | Accept/reject connection |
| GET | `/` | ✅ | List your connections |
| GET | `/pending` | ✅ | List pending requests |

#### Send Connection Request
```http
POST /api/Connection/request
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "targetUserId": "{{userId}}"
}
```

#### Respond to Request
```http
PUT /api/Connection/{connectionId}/respond
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "status": 1
}
```
> Status: 1 = Accepted, 2 = Rejected

---

### 📹 Live Sessions (`/api/LiveSession`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | List all live sessions |
| GET | `/{id}` | ✅ | Get session by ID |
| POST | `/` | ✅ | Create live session |
| PUT | `/{id}` | ✅ | Update live session |
| DELETE | `/{id}` | ✅ | Delete live session |

#### Create Session
```http
POST /api/LiveSession
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "title": "Weekly Q&A",
    "description": "General Q&A session",
    "meetingUrl": "https://zoom.us/j/123456",
    "scheduledAt": "2026-06-01T20:00:00Z"
}
```

---

### 📚 Content (`/api/Content`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/modules` | ✅ | Any | Get training modules |
| POST | `/modules` | ✅ | Admin | Create training module |
| GET | `/sessions` | ✅ | Any | Get all sessions |
| POST | `/sessions` | ✅ | Admin | Create session |

---

### 📧 Invites (`/api/Invite`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/generate` | ✅ | Admin+ | Generate invite code |
| GET | `/` | ✅ | Admin+ | List all invites |
| DELETE | `/{id}` | ✅ | Admin+ | Revoke invite |

---

## Standard Response Format

All API responses follow this format:

```json
{
    "message": "Success message",
    "data": { /* response data */ },
    "success": true
}
```

Error responses:
```json
{
    "message": "Error description",
    "data": null,
    "success": false
}
```

---

## Test Plan

### Prerequisites
1. Start the API: `cd backend/TheTribe.Api && dotnet run`
2. Use the `test_flow.http` file in VS Code with REST Client extension

### Test Flow Order

#### Phase 1: Authentication & Setup
1. ✅ Register User A (Alice)
2. ✅ Login User A
3. ✅ Register User B (Bob)
4. ✅ Login User B
5. ✅ Test wrong password login (expect 401)

#### Phase 2: User Profiles
1. ✅ Get own profile (`GET /api/Users/me`)
2. ✅ Update profile (`PUT /api/Users/me`)
3. ✅ View other user's profile (`GET /api/Users/{id}`)

#### Phase 3: Social Connections
1. ✅ A sends connection request to B
2. ✅ B checks pending requests
3. ✅ B accepts request
4. ✅ Both check their connections

#### Phase 4: Chat
1. ✅ Send global message
2. ✅ Send private message (A → B)
3. ✅ Get chat history
4. ✅ Get conversations list
5. ✅ Mark conversation as read

#### Phase 5: Admin Functions
1. ✅ Login as SuperAdmin
2. ✅ Promote Alice to Admin
3. ✅ Create chat room (as Admin)
4. ✅ Add member to room
5. ✅ Send message to room

#### Phase 6: User Management (SuperAdmin)
1. ✅ List all users
2. ✅ Suspend user
3. ✅ Verify suspended user can't login
4. ✅ Reactivate user
5. ✅ Delete user

### Test Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Super Admin | superadmin@tribe.com | Password123! | SuperAdmin |
| Alice | alice@tribe.com | Password123! | Member/Admin |
| Bob | bob@tribe.com | Password123! | Member |

---

## Development

### Running the API
```bash
cd backend/TheTribe.Api
dotnet run
```

### Running Migrations
```bash
cd backend
dotnet ef migrations add MigrationName --project TheTribe.Infrastructure --startup-project TheTribe.Api
dotnet ef database update --project TheTribe.Infrastructure --startup-project TheTribe.Api
```

### Database Seeding
On first run, a SuperAdmin is automatically created with:
- Email: `superadmin@tribe.com`
- Password: `Password123!`
