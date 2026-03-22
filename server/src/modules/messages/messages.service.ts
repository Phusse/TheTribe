import { prisma } from "../../config/database";
import { isUserOnline } from "./messages.gateway";

export const getConversations = async (userId: string) => {
  // Find all distinct users we have exchanged messages with
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true, isActive: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true, isActive: true } },
    },
  });

  // Group by partner
  const conversationsMap = new Map<string, any>();

  for (const m of messages) {
    const isSender = m.senderId === userId;
    const partner = isSender ? m.receiver : m.sender;

    if (!conversationsMap.has(partner.id)) {
      conversationsMap.set(partner.id, {
        partner: {
          id: partner.id,
          firstName: partner.firstName,
          lastName: partner.lastName,
          profilePhotoUrl: partner.profilePhotoUrl,
          isActive: partner.isActive, // DB active state
          isOnline: isUserOnline(partner.id), // Live websocket state
        },
        lastMessage: m.text,
        lastMessageAt: m.createdAt.toISOString(),
        unreadCount: !isSender && !m.read ? 1 : 0,
      });
    } else if (!isSender && !m.read) {
      // Increment unread count for older unread messages from this partner
      const conv = conversationsMap.get(partner.id);
      conv.unreadCount += 1;
    }
  }

  return Array.from(conversationsMap.values());
};

export const getMessageHistory = async (userId: string, partnerId: string) => {
  // Mark all unread messages from partner as read
  await prisma.message.updateMany({
    where: {
      senderId: partnerId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    text: m.text,
    senderId: m.senderId,
    receiverId: m.receiverId,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  }));
};

// Only used by REST API if not using Socket.IO emitting
export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  return prisma.message.create({
    data: {
      senderId,
      receiverId,
      text,
    },
  });
};
