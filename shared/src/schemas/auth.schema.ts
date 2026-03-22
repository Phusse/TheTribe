import { z } from "zod";

export const RegisterSchema = z.object({
    firstName: z.string().min(1, "First name required").max(50),
    lastName: z.string().min(1, "Last name required").max(50),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    inviteCode: z.string().min(1, "Invite code is strictly required to join"),
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password required"),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token required"),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
