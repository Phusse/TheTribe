import { Request, Response, NextFunction } from "express";
import * as trainingService from "./training.service";
import { sendSuccess, sendCreated } from "../../utils/response";

export const getModulesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const modules = await trainingService.getModules(req.user!.sub);
    sendSuccess(res, modules);
  } catch (err) {
    next(err);
  }
};

export const updateProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const progress = await trainingService.updateProgress(req.user!.sub, req.body);
    sendSuccess(res, progress, "Progress updated");
  } catch (err) {
    next(err);
  }
};

export const createModuleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const module = await trainingService.createModule(req.body);
    sendCreated(res, module, "Training module created");
  } catch (err) {
    next(err);
  }
};
