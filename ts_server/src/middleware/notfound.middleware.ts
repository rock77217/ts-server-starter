import createHttpError from "http-errors";
import { NextFunction, Request, Response } from "express";

const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404));
};

export default notFoundMiddleware;
