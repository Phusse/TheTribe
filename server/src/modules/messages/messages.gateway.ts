import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "../../utils/jwt";
import * as messagesService from "./messages.service";
import { prisma } from "../../config/database";

// Keep track of connected users: maps userId -> socketId
const connectedUsers = new Map<string, string>();

export const registerMessageGateway = (io: SocketIOServer) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication error: Token missing"));
      
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.sub;
    
    // Register user 
    connectedUsers.set(userId, socket.id);
    console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);

    // Broadcast online status to connections
    socket.broadcast.emit("user:online", { userId });

    socket.on("message:send", async (data: { receiverId: string; text: string }, callback) => {
      try {
        // Save to database
        const message = await messagesService.sendMessage(userId, data.receiverId, data.text);
        
        // Populate sender info for the real-time event
        const populatedMsg = await prisma.message.findUnique({
          where: { id: message.id },
          include: { sender: { select: { firstName: true, lastName: true } } }
        });

        // Send to receiver if they are online
        const receiverSocketId = connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message:receive", populatedMsg);
        }

        // Acknowledge success to sender
        if (callback) callback({ status: "ok", message: populatedMsg });
      } catch (err: any) {
        if (callback) callback({ status: "error", error: err.message });
      }
    });

    socket.on("message:typing", (data: { receiverId: string }) => {
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:typing", { senderId: userId });
      }
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
      console.log(`🔌 User disconnected: ${userId}`);
      io.emit("user:offline", { userId });
    });
  });
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};
