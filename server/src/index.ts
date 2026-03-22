import "dotenv/config";
import { env } from "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { corsOptions } from "./config/cors";
import { errorMiddleware } from "./middleware/error.middleware";
import { healthRouter } from "./routes/health.route";

// ── Module routes (imported as they are implemented) ──────────────────────────
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { trainingRouter } from "./modules/training/training.routes";
import { sessionsRouter } from "./modules/sessions/sessions.routes";
import { messagesRouter } from "./modules/messages/messages.routes";
import { groupsRouter } from "./modules/groups/groups.routes";
import { connectionsRouter } from "./modules/connections/connections.routes";
import { invitesRouter } from "./modules/invites/invites.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { registerMessageGateway } from "./modules/messages/messages.gateway";
import { searchRouter } from "./modules/search/search.routes";

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

registerMessageGateway(io);

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/training", trainingRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/connections", connectionsRouter);
app.use("/api/invites", invitesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/search", searchRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`🌍 Accepting requests from: ${env.CLIENT_URL}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});

export default app;
