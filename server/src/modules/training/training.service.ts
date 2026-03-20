import { prisma } from "../../config/database";
import type { CreateModuleInput, UpdateProgressInput } from "@thetribe/shared";

// ── Training Modules ──────────────────────────────────────────────────────────

export const getModules = async (userId: string) => {
  // Fetch modules with lessons, and left join user's progress
  const modules = await prisma.trainingModule.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      progress: {
        where: { userId },
        take: 1,
      },
    },
  });

  // Map to the shared type shape
  return modules.map((m) => {
    const userProgress = m.progress[0];
    const progressValue = userProgress?.progress ?? 0;
    
    return {
      id: m.id,
      title: m.title,
      category: m.category,
      duration: m.duration,
      order: m.order,
      lessons: m.lessons,
      progress: progressValue,
      completed: !!userProgress?.completedAt,
    };
  });
};

export const createModule = async (input: CreateModuleInput) => {
  return prisma.trainingModule.create({
    data: {
      title: input.title,
      category: input.category,
      duration: input.duration,
      order: input.order,
    },
  });
};

// ── Progress Tracking ─────────────────────────────────────────────────────────

export const updateProgress = async (userId: string, input: UpdateProgressInput) => {
  const isCompleted = input.progress >= 100;
  
  return prisma.trainingProgress.upsert({
    where: {
      userId_moduleId: {
        userId,
        moduleId: input.moduleId,
      },
    },
    update: {
      progress: input.progress,
      completedAt: isCompleted ? new Date() : null,
    },
    create: {
      userId,
      moduleId: input.moduleId,
      progress: input.progress,
      completedAt: isCompleted ? new Date() : null,
    },
  });
};
