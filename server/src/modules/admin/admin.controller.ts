import { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service";
import { sendSuccess, sendError } from "../../utils/response";

export const getStatsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

export const getUsersController = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await adminService.getUsers();
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

export const updateUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await adminService.updateUserRole(req.user!.sub, id, role);
    sendSuccess(res, result, "User role updated");
  } catch (err: any) {
    if (err.message.includes("own role")) sendError(res, err.message, 400);
    else next(err);
  }
};

export const toggleUserStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const result = await adminService.toggleUserStatus(req.user!.sub, id, isActive);
    sendSuccess(res, result, `User ${isActive ? "activated" : "deactivated"}`);
  } catch (err: any) {
    if (err.message.includes("yourself")) sendError(res, err.message, 400);
    else next(err);
  }
};
