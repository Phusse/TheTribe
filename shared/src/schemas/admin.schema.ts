import { z } from "zod";

export const UpdateSystemSettingsSchema = z.object({
    newMemberNotifications: z.boolean().optional(),
    sessionReminders: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    requireInviteCode: z.boolean().optional(),
    openRegistration: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
});

export type UpdateSystemSettingsInput = z.infer<typeof UpdateSystemSettingsSchema>;
