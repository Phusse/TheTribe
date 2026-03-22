import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);
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
