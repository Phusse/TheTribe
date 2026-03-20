import { Request, Response, NextFunction } from "express";
import * as trainingService from "./training.service";
import { sendSuccess, sendCreated } from "../../utils/response";

// ── Members ───────────────────────────────────────────────────────────────────

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

// ── Admin: Modules ────────────────────────────────────────────────────────────

export const getAdminModulesController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const modules = await trainingService.getAdminModules();
    sendSuccess(res, modules);
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

export const updateModuleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const module = await trainingService.updateModule(req.params.id as string, req.body);
    sendSuccess(res, module, "Training module updated");
  } catch (err) {
    next(err);
  }
};

export const deleteModuleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await trainingService.deleteModule(req.params.id as string);
    sendSuccess(res, null, "Training module deleted");
  } catch (err) {
    next(err);
  }
};

// ── Admin: Lessons ────────────────────────────────────────────────────────────

export const createLessonController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await trainingService.createLesson(req.body);
    sendCreated(res, lesson, "Lesson created");
  } catch (err) {
    next(err);
  }
};

export const updateLessonController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lesson = await trainingService.updateLesson(req.params.id as string, req.body);
    sendSuccess(res, lesson, "Lesson updated");
  } catch (err) {
    next(err);
  }
};

export const deleteLessonController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await trainingService.deleteLesson(req.params.id as string);
    sendSuccess(res, null, "Lesson deleted");
  } catch (err) {
    next(err);
  }
};
