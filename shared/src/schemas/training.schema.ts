import { z } from "zod";

export const CreateModuleSchema = z.object({
    title: z.string().min(1).max(100),
    category: z.string().min(1).max(50),
    duration: z.string().min(1),
    order: z.number().int().min(0),
    thumbnailUrl: z.string().optional(),
});

export const UpdateModuleSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(50).optional(),
    duration: z.string().min(1).optional(),
    order: z.number().int().min(0).optional(),
    published: z.boolean().optional(),
    thumbnailUrl: z.string().optional(),
});

export const CreateLessonSchema = z.object({
    moduleId: z.string().cuid(),
    title: z.string().min(1).max(200),
    duration: z.string().min(1),
    order: z.number().int().min(0),
    content: z.string().optional().nullable(),
});

export const UpdateLessonSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    duration: z.string().min(1).optional(),
    order: z.number().int().min(0).optional(),
    content: z.string().optional().nullable(),
});

export const UpdateProgressSchema = z.object({
    moduleId: z.string().cuid(),
    progress: z.number().int().min(0).max(100),
});

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>;
export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>;
export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;
