import { prisma } from "../../config/database";
import type {
  CreateModuleInput,
  UpdateModuleInput,
  CreateLessonInput,
  UpdateLessonInput,
  UpdateProgressInput,
} from "@thetribe/shared";
import { uploadImageToCloudinary } from "../../utils/cloudinary";

// ── Admin: Modules ────────────────────────────────────────────────────────────

export const getAdminModules = async () => {
  const modules = await prisma.trainingModule.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" } },
      _count: { select: { progress: true } },
    },
  });

  return modules.map((m) => ({
    id: m.id,
    title: m.title,
    category: m.category,
    duration: m.duration,
    order: m.order,
    published: m.published,
    thumbnailUrl: m.thumbnailUrl,
    lessons: m.lessons,
    enrolledCount: m._count.progress,
  }));
};

export const createModule = async (input: CreateModuleInput) => {
  let thumbUrl = input.thumbnailUrl;
  if (thumbUrl && thumbUrl.startsWith("data:image/")) {
    thumbUrl = await uploadImageToCloudinary(thumbUrl, "thetribe/training");
  }

  return prisma.trainingModule.create({
    data: {
      title: input.title,
      category: input.category,
      duration: input.duration,
      order: input.order,
      thumbnailUrl: thumbUrl,
    },
    include: { lessons: true },
  });
};

export const updateModule = async (id: string, input: UpdateModuleInput) => {
  let thumbUrl = input.thumbnailUrl;
  if (thumbUrl && thumbUrl.startsWith("data:image/")) {
    thumbUrl = await uploadImageToCloudinary(thumbUrl, "thetribe/training");
  }

  return prisma.trainingModule.update({
    where: { id },
    data: {
      ...input,
      ...(thumbUrl !== undefined && { thumbnailUrl: thumbUrl }),
    },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
};

export const deleteModule = async (id: string) => {
  return prisma.trainingModule.delete({ where: { id } });
};

// ── Admin: Lessons ────────────────────────────────────────────────────────────

export const createLesson = async (input: CreateLessonInput) => {
  return prisma.lesson.create({
    data: {
      moduleId: input.moduleId,
      title: input.title,
      duration: input.duration,
      order: input.order,
      content: input.content ?? null,
    },
  });
};

export const updateLesson = async (id: string, input: UpdateLessonInput) => {
  return prisma.lesson.update({
    where: { id },
    data: input,
  });
};

export const deleteLesson = async (id: string) => {
  return prisma.lesson.delete({ where: { id } });
};

// ── Members: Modules with Progress ───────────────────────────────────────────

export const getModules = async (userId: string) => {
  const modules = await prisma.trainingModule.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" } },
      progress: { where: { userId }, take: 1 },
    },
  });

  return modules.map((m) => {
    const userProgress = m.progress[0];
    const progressValue = userProgress?.progress ?? 0;

    return {
      id: m.id,
      title: m.title,
      category: m.category,
      duration: m.duration,
      order: m.order,
      published: m.published,
      thumbnailUrl: m.thumbnailUrl,
      lessons: m.lessons,
      progress: progressValue,
      completed: !!userProgress?.completedAt,
    };
  });
};

// ── Progress Tracking ─────────────────────────────────────────────────────────

export const updateProgress = async (userId: string, input: UpdateProgressInput) => {
  const isCompleted = input.progress >= 100;

  return prisma.trainingProgress.upsert({
    where: { userId_moduleId: { userId, moduleId: input.moduleId } },
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
