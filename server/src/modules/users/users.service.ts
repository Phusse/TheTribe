import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import type { UpdateProfileInput, UpdateSettingsInput } from "@thetribe/shared";
import { uploadImageToCloudinary } from "../../utils/cloudinary";

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
  let photoUrl = input.profilePhotoUrl;

  if (photoUrl && photoUrl.startsWith("data:image/")) {
    photoUrl = await uploadImageToCloudinary(photoUrl, "thetribe/avatars");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName && { firstName: input.firstName }),
      ...(input.lastName && { lastName: input.lastName }),
      ...(photoUrl !== undefined && { profilePhotoUrl: photoUrl }),
      ...(input.occupation !== undefined && { occupation: input.occupation }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.phone !== undefined && { phone: input.phone }),
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
  const [connections, unreadMessages, groups, pendingConnections] = await Promise.all([
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
    // Pending incoming connection requests
    prisma.connection.count({
      where: {
        receiverId: userId,
        status: "pending",
      },
    }),
  ]);

  return { connections, unreadMessages, groups, pendingConnections };
};

export const getDiscoverableUsers = async (userId: string) => {
  // Find all current connections or pending requests
  const userConnections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    select: { requesterId: true, receiverId: true },
  });

  const connectedUserIds = new Set(
    userConnections.flatMap((c) => [c.requesterId, c.receiverId])
  );
  connectedUserIds.add(userId);

  // Return max 50 active users who aren't the user or already connected
  const users = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(connectedUserIds) },
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhotoUrl: true,
      occupation: true,
      location: true,
    },
    take: 50,
  });

  return users;
};
