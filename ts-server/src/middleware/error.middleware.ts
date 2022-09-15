import { NextFunction, Request, Response } from "express";
import HttpException from "@exceptions/HttpException";
import { logger } from "@utils/logger";
import { HttpError } from "http-errors";
import axios from "axios";

const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    error.stack ? logger.error(error.stack) : logger.error(error.message);
    if (axios.isAxiosError(error)) {
      if (error.response?.status) res.status(error.response?.status);
      res.json(error.response?.data);
    } else if (error instanceof HttpException || error instanceof HttpError) {
      res.status(error.status || 500).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: error.message,
      });
    }
  } catch (error) {}
};

export default errorMiddleware;
