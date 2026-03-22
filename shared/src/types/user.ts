export type UserRole = "MEMBER" | "ADMIN" | "SUPERADMIN";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    profilePhotoUrl?: string | null;
    occupation?: string | null;
    bio?: string | null;
    location?: string | null;
    phone?: string | null;
    pledgeAccepted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserSettings {
    id: string;
    userId: string;
    pushNotifications: boolean;
    emailDigest: boolean;
    darkMode: boolean;
    showOnlineStatus: boolean;
    twoFactorEnabled: boolean;
}

/** Safe user shape returned to clients (no passwordHash) */
export type PublicUser = Omit<User, "pledgeAccepted"> & {
    settings?: UserSettings | null;
};
