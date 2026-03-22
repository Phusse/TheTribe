import { Response } from "express";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message = "OK",
    statusCode = 200
): void => {
    res.status(statusCode).json(<ApiResponse<T>>{
        success: true,
        message,
        data,
    });
};

export const sendCreated = <T>(res: Response, data: T, message = "Created"): void => {
    sendSuccess(res, data, message, 201);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode = 400,
    errors?: Record<string, string[]>
): void => {
    res.status(statusCode).json(<ApiResponse<null>>{
        success: false,
        message,
        errors,
    });
};
