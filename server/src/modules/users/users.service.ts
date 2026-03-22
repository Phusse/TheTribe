import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import type { UpdateProfileInput, UpdateSettingsInput } from "@thetribe/shared";

// ── Helpers ───────────────────────────────────────────────────────────────────
function omitPassword<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ── Users Service ─────────────────────────────────────────────────────────────
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });

  if (!user) throw new AppError("User not found", 404);
  return omitPassword(user);
};

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(input.profilePhotoUrl !== undefined && { profilePhotoUrl: input.profilePhotoUrl }),
    },
    include: { settings: true },
  });

  return omitPassword(user);
};

export const updateSettings = async (userId: string, input: UpdateSettingsInput) => {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: input,
    create: {
      userId,
      ...input,
    },
  });

  return settings;
};

export const getUserStats = async (userId: string) => {
  const [connections, unreadMessages, groups] = await Promise.all([
    // Active connections count
    prisma.connection.count({
      where: {
        status: "accepted",
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
    }),
    // Unread direct messages
    prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    }),
    // Group memberships
    prisma.groupMember.count({
      where: { userId },
    }),
  ]);

  return { connections, unreadMessages, groups };
};
