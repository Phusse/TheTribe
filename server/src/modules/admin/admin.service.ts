import { prisma } from "../../config/database";
import type { UpdateSystemSettingsInput } from "@thetribe/shared";

export const getSystemSettings = async () => {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: {} });
  }
  return settings;
};

export const updateSystemSettings = async (input: UpdateSystemSettingsInput) => {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: input });
    return settings;
  }
  return prisma.systemSettings.update({
    where: { id: settings.id },
    data: input,
  });
};

export const getDashboardStats = async () => {
  const [totalUsers, totalGroups, totalModules, totalInvites] = await Promise.all([
    prisma.user.count(),
    prisma.group.count(),
    prisma.trainingModule.count(),
    prisma.inviteCode.count(),
  ]);

  return {
    totalUsers,
    totalGroups,
    totalModules,
    totalInvites,
  };
};

export const getUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

export const updateUserRole = async (adminId: string, targetUserId: string, role: string) => {
  if (adminId === targetUserId) {
    throw new Error("Cannot change your own role");
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { role: role as any },
    select: { id: true, email: true, role: true },
  });
};

export const toggleUserStatus = async (adminId: string, targetUserId: string, isActive: boolean) => {
  if (adminId === targetUserId) {
    throw new Error("Cannot deactivate yourself");
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
    select: { id: true, email: true, isActive: true },
  });
};
