import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { randomBytes } from "crypto";

export const getInvites = async () => {
  const invites = await prisma.inviteCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return invites.map((i) => ({
    id: i.id,
    code: i.code,
    used: i.used,
    createdAt: i.createdAt.toISOString(),
    usedAt: i.usedAt?.toISOString(),
    usedBy: i.usedBy
      ? { id: i.usedBy.id, name: `${i.usedBy.firstName} ${i.usedBy.lastName}` }
      : null,
  }));
};

export const getInviteAttempts = async () => {
  return prisma.inviteAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Just return the most recent 100 attempts for the UI
  });
};

export const createInvite = async (adminId: string, customCode?: string) => {
  // Generate a code if one wasn't provided (e.g. TRIBE-XXXX)
  const code = customCode || `TRIBE-${randomBytes(3).toString("hex").toUpperCase()}`;

  const existing = await prisma.inviteCode.findUnique({
    where: { code },
  });

  if (existing) {
    throw new AppError("Invite code already exists", 400);
  }

  return prisma.inviteCode.create({
    data: {
      code,
      createdById: adminId,
    },
  });
};

export const deleteInvite = async (inviteId: string) => {
  const invite = await prisma.inviteCode.findUnique({
    where: { id: inviteId },
  });

  if (!invite) throw new AppError("Invite not found", 404);
  if (invite.used) throw new AppError("Cannot delete an already used invite", 400);

  await prisma.inviteCode.delete({
    where: { id: inviteId },
  });
};
