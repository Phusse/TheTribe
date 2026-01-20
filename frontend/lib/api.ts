// API Integration Layer - Connected to Real Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5290";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("tribe_user");
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    console.log("[API] Token status:", parsed.token ? "Found ✓" : "Missing ✗");
    return parsed.token;
  } catch {
    console.error("[API] Failed to parse stored user");
    return null;
  }
}

// Helper for authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  if (!token) {
    console.warn("[API] No auth token found - redirecting to login");
    handleAutoLogout();
    return { success: false, error: "Not authenticated. Please login." };
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  console.log(`[API] ${options.method || "GET"} ${endpoint}`);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle empty responses
    const text = await response.text();
    const json = text ? JSON.parse(text) : {};

    if (!response.ok) {
      console.error(`[API] Error ${response.status}:`, json);

      // Auto-logout on 401 (Unauthorized) or token expired
      if (response.status === 401) {
        console.warn("[API] Token expired or invalid - logging out");
        handleAutoLogout();
        return { success: false, error: "Session expired. Redirecting to login..." };
      }

      return {
        success: false,
        error: json.message || `Error: ${response.status}`,
      };
    }

    return {
      success: true,
      data: json.data ?? json,
      message: json.message,
    };
  } catch (error) {
    console.error("[API] Network Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Auto-logout helper - clears storage and redirects to login
function handleAutoLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("tribe_user");
    // Redirect to login page
    window.location.href = "/auth/login";
  }
}

export const api = {
  auth: {
    validateInvite: async (code: string): Promise<ApiResponse<void>> => {
      if (!code || code.trim() === "") {
        return { success: false, error: "Invalid invite code." };
      }
      return { success: true };
    },

    login: async (
      email: string,
      password: string
    ): Promise<ApiResponse<{ token: string; role: string; id: string; firstName: string; lastName: string }>> => {
      try {
        console.log("[API] Attempting login for:", email);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const json = await response.json();
        console.log("[API] Login raw response:", JSON.stringify(json, null, 2));

        if (!response.ok) {
          return {
            success: false,
            error: json.message || "Login failed",
          };
        }

        // Backend returns: { data: { accessToken, refreshToken, id, email, firstName, lastName, role, ... }, success: true }
        const authData = json.data || json;

        // Role comes as a string like "Member", "Admin", "SuperAdmin"
        const roleStr = String(authData.role || "Member").toLowerCase();
        const role = roleStr === "superadmin" ? "superadmin" : roleStr === "admin" ? "admin" : "member";

        console.log("[API] Extracted auth data:", {
          hasToken: !!authData.accessToken,
          role: role,
          id: authData.id,
          firstName: authData.firstName,
        });

        if (!authData.accessToken) {
          console.error("[API] No accessToken in response!");
          return { success: false, error: "Login response missing token" };
        }

        return {
          success: true,
          data: {
            token: authData.accessToken, // Map accessToken -> token
            role: role,
            id: authData.id,
            firstName: authData.firstName || "",
            lastName: authData.lastName || "",
          },
        };
      } catch (error) {
        console.error("[API] Login error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        };
      }
    },

    register: async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      inviteCode?: string
    ): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password, inviteCode }),
        });

        const json = await response.json();

        if (!response.ok) {
          return { success: false, error: json.message || "Registration failed" };
        }

        return { success: true, data: json.data || json };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Network error",
        };
      }
    },
  },

  admin: {
    getInvites: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/Invite");
    },

    generateInvite: async (): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>("/api/Invite/generate", { method: "POST" });
    },

    revokeInvite: async (id: string): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>(`/api/Invite/${id}`, { method: "DELETE" });
    },

    getUsers: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/Users");
    },

    updateUserRole: async (userId: string, role: number): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>(`/api/Users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
    },

    updateUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>(`/api/Users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
    },
  },

  messaging: {
    getConversations: async (filter: string = "all"): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>(`/api/Chat/conversations?filter=${filter}`);
    },

    getMessages: async (conversationId?: string, isGroup?: boolean): Promise<ApiResponse<any[]>> => {
      // For groups, pass chatRoomId. For DMs, don't pass chatRoomId (backend filters by receiver)
      const query = conversationId && isGroup ? `?chatRoomId=${conversationId}` : "";
      return fetchWithAuth<any[]>(`/api/Chat/history${query}`);
    },

    sendMessage: async (
      content: string,
      receiverId?: string,
      chatRoomId?: string
    ): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>("/api/Chat/send", {
        method: "POST",
        body: JSON.stringify({ content, receiverId, chatRoomId }),
      });
    },

    markAsRead: async (conversationId: string, isGroup: boolean): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>("/api/Chat/mark-read", {
        method: "POST",
        body: JSON.stringify({ conversationId, isGroup }),
      });
    },

    getChatRooms: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/ChatRoom");
    },

    getChatRoom: async (id: string): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>(`/api/ChatRoom/${id}`);
    },

    createRoom: async (name: string, description: string): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>("/api/ChatRoom", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
    },

    addMember: async (roomId: string, userId: string): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>(`/api/ChatRoom/${roomId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
    },
  },

  training: {
    getVideos: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/Content/modules");
    },

    createModule: async (data: {
      title: string;
      description: string;
      thumbnailUrl?: string;
    }): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>("/api/Content/modules", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  },

  live: {
    getSessions: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/LiveSession");
    },

    getSession: async (id: string): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>(`/api/LiveSession/${id}`);
    },

    createSession: async (data: {
      title: string;
      description: string;
      meetingUrl: string;
      scheduledAt: string;
    }): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>("/api/LiveSession", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    updateSession: async (id: string, data: any): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>(`/api/LiveSession/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    deleteSession: async (id: string): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>(`/api/LiveSession/${id}`, { method: "DELETE" });
    },
  },

  user: {
    getProfile: async (): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>("/api/Users/me");
    },

    updateProfile: async (data: {
      bio?: string;
      phoneNumber?: string;
      location?: string;
      occupation?: string;
      dateOfBirth?: string;
    }): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>("/api/Users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    getUserById: async (id: string): Promise<ApiResponse<any>> => {
      return fetchWithAuth<any>(`/api/Users/${id}`);
    },
  },

  connections: {
    getConnections: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/Connection");
    },

    getPending: async (): Promise<ApiResponse<any[]>> => {
      return fetchWithAuth<any[]>("/api/Connection/pending");
    },

    sendRequest: async (targetUserId: string): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>("/api/Connection/request", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
    },

    respondToRequest: async (connectionId: string, status: number): Promise<ApiResponse<void>> => {
      return fetchWithAuth<void>(`/api/Connection/${connectionId}/respond`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
  },
};
