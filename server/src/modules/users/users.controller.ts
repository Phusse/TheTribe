import { Request, Response, NextFunction } from "express";
import * as usersService from "./users.service";
import { sendSuccess } from "../../utils/response";

export const getProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await usersService.getUserProfile(req.user!.sub);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await usersService.updateProfile(req.user!.sub, req.body);
    sendSuccess(res, result, "Profile updated");
  } catch (err) {
    next(err);
  }
};

export const updateSettingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await usersService.updateSettings(req.user!.sub, req.body);
    sendSuccess(res, result, "Settings updated");
  } catch (err) {
    next(err);
  }
};

export const getStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await usersService.getUserStats(req.user!.sub);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

export const getDiscoverableUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await usersService.getDiscoverableUsers(req.user!.sub);
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};
