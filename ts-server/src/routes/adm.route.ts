import { Router } from "express";
import admController from "@/controllers/adm.controller";
import { Routes } from "@/interfaces/routes.interface";

class AdmRoute implements Routes {
  public path = "/adm";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/init_adm`, admController.initAdm);

    this.router.patch(`${this.path}/activate`, admController.activeAdm);

    this.router.get(`${this.path}/list_users`, admController.listUsers);

    this.router.put(`${this.path}/save_user`, admController.saveUser);
  }
}

export default AdmRoute;
