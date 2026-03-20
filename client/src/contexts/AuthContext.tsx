import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";

export type UserRole = "MEMBER" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profilePhotoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the current user profile using the token
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (err) {
        // If it fails (and refresh intercepts failed), clear everything
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for global logout events dispatched by the api interceptor or other components
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    window.location.href = "/login"; // Force clear route protection
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const isSuperAdmin = user?.role === "SUPERADMIN";

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
