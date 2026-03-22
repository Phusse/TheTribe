import { z } from "zod";

export const CreateGroupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description is too long"),
});

export const UpdateGroupSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().min(10).max(500).optional(),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;
