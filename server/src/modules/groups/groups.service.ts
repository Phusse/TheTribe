import { prisma } from "../../config/database";

export const getGroups = async (userId: string) => {
  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: { members: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      members: {
        where: { userId },
        take: 1,
      },
    },
  });

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    createdAt: g.createdAt.toISOString(),
    memberCount: g._count.members,
    lastActivity: g.messages[0]?.createdAt.toISOString() || g.createdAt.toISOString(),
    isJoined: g.members.length > 0,
  }));
};

export const joinGroup = async (userId: string, groupId: string) => {
  return prisma.groupMember.create({
    data: { userId, groupId },
  });
};

export const leaveGroup = async (userId: string, groupId: string) => {
  return prisma.groupMember.delete({
    where: {
      userId_groupId: { userId, groupId },
    },
  });
};

export const getGroupMessages = async (userId: string, groupId: string) => {
  // First verify user is a member
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (!membership) {
    throw new Error("Must be a group member to view messages");
  }

  const messages = await prisma.groupMessage.findMany({
    where: { groupId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true },
      },
    },
  });

  return messages.map((m) => ({
    id: m.id,
    text: m.text,
    userId: m.userId,
    groupId: m.groupId,
    createdAt: m.createdAt.toISOString(),
    sender: {
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      avatar: m.user.profilePhotoUrl,
    },
  }));
};

export const sendGroupMessage = async (userId: string, groupId: string, text: string) => {
  // Verify membership
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  if (!membership) throw new Error("Must be a group member to send messages");

  return prisma.groupMessage.create({
    data: {
      userId,
      groupId,
      text,
    },
    include: {
      user: { select: { firstName: true, lastName: true, profilePhotoUrl: true } },
    },
  });
};
