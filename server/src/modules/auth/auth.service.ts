import { prisma } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AppError } from "../../middleware/error.middleware";
import type { RegisterInput, LoginInput, RefreshInput } from "./auth.schema";

// ── Helpers ───────────────────────────────────────────────────────────────────
function omitPassword<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

function issueTokens(user: { id: string; email: string; role: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

// ── Auth Service ──────────────────────────────────────────────────────────────
export const register = async (input: RegisterInput) => {
  const { firstName, lastName, email, password, inviteCode } = input;

  // 1. Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already in use", 409);

  // 2. Validate invite code (optional, but if provided it must exist and be unused)
  let invite = null;
  if (inviteCode) {
    invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
    if (!invite) throw new AppError("Invalid invite code", 400);
    if (invite.used) throw new AppError("Invite code already used", 400);
  }

  // 3. Hash password & create user
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      settings: { create: {} },
    },
  });

  // 4. Mark the invite code as used
  if (invite) {
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { used: true, usedById: user.id, usedAt: new Date() },
    });
  }

  // 5. Issue tokens
  const tokens = issueTokens(user);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { user: omitPassword(user), ...tokens };
};

export const login = async (input: LoginInput) => {
  const { email, password } = input;

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true },
  });
  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  // 2. Verify password
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid credentials", 401);

  // 3. Issue tokens
  const tokens = issueTokens(user);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user: omitPassword(user), ...tokens };
};

export const refresh = async (input: RefreshInput) => {
  const { refreshToken } = input;

  // 1. Verify the JWT signature and payload
  let payload: { sub: string; email: string; role: string };
  try {
    payload = verifyRefreshToken(refreshToken) as typeof payload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 2. Check it exists in the DB (rotation / revocation support)
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token expired or revoked", 401);
  }

  // 3. Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const newTokens = issueTokens({ id: payload.sub, email: payload.email, role: payload.role });
  await prisma.refreshToken.create({
    data: {
      token: newTokens.refreshToken,
      userId: payload.sub,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return newTokens;
};

export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

export const acceptPledge = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { pledgeAccepted: true },
  });
};
