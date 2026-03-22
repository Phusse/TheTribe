import { prisma } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AppError } from "../../middleware/error.middleware";
import { sendEmail } from "../../utils/email.service";
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
export const register = async (input: RegisterInput, ipAddress?: string) => {
  const { firstName, lastName, email, password, inviteCode } = input;

  const settings = await prisma.systemSettings.findFirst();

  if (settings?.maintenanceMode) {
    throw new AppError("The platform is currently under maintenance. Registrations are paused.", 503);
  }

  // 1. Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already in use", 409);

  // 2. Validate invite code
  // If requireInviteCode is TRUE, you absolutely MUST have a code.
  if (settings?.requireInviteCode && !inviteCode) {
    await prisma.inviteAttempt.create({ data: { code: "MISSING", email, ipAddress, status: "MISSING" } });
    throw new AppError("An invite code is required to join The Tribe.", 400);
  }

  // If Open Registration is FALSE, but requireInviteCode is FALSE, we technically allow them if no code.
  // But usually, Open Registration overrides. Let's strictly process the invite code ONLY if provided.
  let invite = null;
  if (inviteCode) {
    invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
    if (!invite) {
      await prisma.inviteAttempt.create({ data: { code: inviteCode, email, ipAddress, status: "INVALID" } });
      throw new AppError("Invalid invite code.", 400);
    }
    if (invite.used) {
      await prisma.inviteAttempt.create({ data: { code: inviteCode, email, ipAddress, status: "ALREADY_USED" } });
      throw new AppError("Invite code already used.", 400);
    }
    await prisma.inviteAttempt.create({ data: { code: inviteCode, email, ipAddress, status: "SUCCESS" } });
  } else if (!settings?.openRegistration && !settings?.requireInviteCode) {
    // Edge case: Neither are checked, but open registration isn't explicitly open.
    // Default to rejecting if we want security as paramount.
    await prisma.inviteAttempt.create({ data: { code: "CLOSED", email, ipAddress, status: "CLOSED" } });
    throw new AppError("Registration is currently closed to the public.", 403);
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

  // 4.X Send Welcome Email Asynchronously
  sendEmail({
    to: user.email,
    subject: "Welcome to The Tribe!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Welcome to The Tribe, ${user.firstName}! 👋</h2>
        <p>We are incredibly excited to have you join our private networking and training platform.</p>
        <p>You can now log in, set up your profile photo, browse the community, and jump into your first Training Module!</p>
        <br/>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
        <br/><br/>
        <p>If you have any questions, just reply to this email!</p>
        <p>Best,<br/>The Tribe Admin Team</p>
      </div>
    `,
  });

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

  const settings = await prisma.systemSettings.findFirst();

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true },
  });

  if (!user) throw new AppError("Invalid credentials", 401);
  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  if (settings?.maintenanceMode && user.role !== "SUPERADMIN") {
    throw new AppError("The platform is currently under maintenance. Please check back soon.", 503);
  }

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

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    // For security, always return success without confirming emails
    return;
  }

  // Dynamic secret: appending the password hash means the token INSTANTLY 
  // invalidates itself the moment they reset their password.
  const secret = env.JWT_ACCESS_SECRET + user.passwordHash;
  const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: "15m" });

  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  sendEmail({
    to: user.email,
    subject: "Reset your Tribe Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Password Reset Request</h2>
        <p>We received a request to reset your password for your Tribe account.</p>
        <p>If you made this request, please click the button below to choose a new password. This link is valid for 15 minutes.</p>
        <br/>
        <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        <br/><br/>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid or expired reset token", 400);

  const secret = env.JWT_ACCESS_SECRET + user.passwordHash;
  try {
    jwt.verify(token, secret);
  } catch (error) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Obliterate all active sessions to force them to log in with new password
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
};
