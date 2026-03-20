import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";

export const getConnections = async (userId: string) => {
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, profilePhotoUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return connections.map((c) => {
    const isRequester = c.requesterId === userId;
    const partner = isRequester ? c.receiver : c.requester;

    return {
      id: c.id,
      requesterId: c.requesterId,
      receiverId: c.receiverId,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      partner,
    };
  });
};

export const requestConnection = async (requesterId: string, receiverId: string) => {
  if (requesterId === receiverId) throw new AppError("Cannot connect with yourself", 400);

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "pending") throw new AppError("Request already pending", 400);
    if (existing.status === "accepted") throw new AppError("Already connected", 400);
  }

  return prisma.connection.create({
    data: {
      requesterId,
      receiverId,
      status: "pending",
    },
  });
};

export const updateConnectionStatus = async (
  userId: string,
  connectionId: string,
  status: "accepted" | "rejected"
) => {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) throw new AppError("Connection not found", 404);
  if (connection.receiverId !== userId) {
    throw new AppError("Only the receiver can accept or reject the request", 403);
  }

  return prisma.connection.update({
    where: { id: connectionId },
    data: { status },
  });
};

export const removeConnection = async (userId: string, connectionId: string) => {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) throw new AppError("Connection not found", 404);
  if (connection.requesterId !== userId && connection.receiverId !== userId) {
    throw new AppError("Not authorized to remove this connection", 403);
  }

  await prisma.connection.delete({
    where: { id: connectionId },
  });
};
