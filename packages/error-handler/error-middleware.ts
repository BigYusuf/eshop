import { AppError } from "."; // Ensure this is the *same file* used when throwing
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof AppError) {

    console.log(`AppError ${req.method} ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.error("Unhandled Error:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong, please try again!",
  });
};
