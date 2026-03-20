import { z } from "zod";

export const CreateModuleSchema = z.object({
    title: z.string().min(1).max(100),
    category: z.string().min(1).max(50),
    duration: z.string().min(1),
    order: z.number().int().min(0),
});

export const UpdateProgressSchema = z.object({
    moduleId: z.string().cuid(),
    progress: z.number().int().min(0).max(100),
});

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;
