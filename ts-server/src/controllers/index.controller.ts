import { NextFunction, Request, Response } from 'express';
import BaseController from './base.controller';

class IndexController extends BaseController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    this.callFunc(req, res, async (req: Request) => {
      return "Express + TypeScript Server";
    });
  };
}

const indexController = new IndexController();
export default indexController;
