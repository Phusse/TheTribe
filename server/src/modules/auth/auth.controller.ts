import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipString = Array.isArray(ip) ? ip[0] : ip?.toString();
    const result = await authService.register(req.body, ipString);
    sendCreated(res, result, "Registration successful");
  } catch (err) {
    next(err);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.refresh(req.body);
    sendSuccess(res, result, "Token refreshed");
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken ?? "");
    sendSuccess(res, null, "Logged out");
  } catch (err) {
    next(err);
  }
};

export const pledgeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.acceptPledge(req.user!.sub);
    sendSuccess(res, null, "Pledge accepted");
  } catch (err) {
    next(err);
  }
};

export const meController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // The JWT payload already has sub/email/role — no DB call needed for lightweight checks
    sendSuccess(res, req.user, "Authenticated");
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    sendSuccess(res, null, "If an account exists with that email, a password reset link has been sent.");
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, token, password } = req.body;
    await authService.resetPassword(email, token, password);
    sendSuccess(res, null, "Password reset successfully. You can now log in.");
  } catch (err) {
    next(err);
  }
};
