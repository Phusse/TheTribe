import { z } from "zod";

export const UpdateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    profilePhotoUrl: z.string().url().optional().nullable(),
});

export const UpdateSettingsSchema = z.object({
    pushNotifications: z.boolean().optional(),
    emailDigest: z.boolean().optional(),
    darkMode: z.boolean().optional(),
    showOnlineStatus: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
