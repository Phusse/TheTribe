import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "member" | "admin" | "superadmin";

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
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: "1",
    firstName: "Marcus",
    lastName: "Johnson",
    email: "marcus@example.com",
    role: "superadmin",
    isActive: true,
  });

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
