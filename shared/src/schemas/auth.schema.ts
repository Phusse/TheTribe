import { z } from "zod";

export const RegisterSchema = z.object({
    firstName: z.string().min(1, "First name required").max(50),
    lastName: z.string().min(1, "Last name required").max(50),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    inviteCode: z.string().optional(),
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password required"),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
