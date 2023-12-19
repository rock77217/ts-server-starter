import BaseController from '@/controllers/base.controller';
import { NextFunction, Request, Response } from 'express';

class IndexController extends BaseController {
  public index = (req: Request, res: Response, next: NextFunction): void => {
    this.callFunc(req, res, next, async () => {
      return "Express + TypeScript Server";
    });
  };
}

const indexController = new IndexController();
export default indexController;
