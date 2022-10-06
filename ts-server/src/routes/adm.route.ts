import { Router } from "express";
import admController from "@controllers/adm.controller";
import { Routes } from "@interfaces/routes.interface";

class AdmRoute implements Routes {
  public path = "/adm";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /adm/init_adm:
     *   get:
     *     summary: Init admin and get api key
     *     tags:
     *       - Admin
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               format: uuid
     *       400:
     *         $ref: '#/components/responses/RequestError'
     *       403:
     *         $ref: '#/components/responses/Unauthorized'
     */
    this.router.get(`${this.path}/init_adm`, admController.initAdm);

    /**
     * @swagger
     * /adm/activate:
     *   patch:
     *     summary: Activate admin by api key from '/adm/init_adm'
     *     tags:
     *       - Admin
     *     produces:
     *       - application/json
     *     security:
     *       - ApiKeyAuth: []
     *     responses:
     *       200:
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       400:
     *         $ref: '#/components/responses/RequestError'
     *       403:
     *         $ref: '#/components/responses/Unauthorized'
     */
    this.router.patch(`${this.path}/activate`, admController.activeAdm);

    /**
     * @swagger
     * /adm/list_users:
     *   get:
     *     summary: Get user information list
     *     tags:
     *       - Admin
     *     produces:
     *       - application/json
     *     security:
     *       - ApiKeyAuth: []
     *     responses:
     *       200:
     *         description: OK
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/User'
     *       400:
     *         $ref: '#/components/responses/RequestError'
     *       403:
     *         $ref: '#/components/responses/Unauthorized'
     */
    this.router.get(`${this.path}/list_users`, admController.listUsers);

    /**
     * @swagger
     * /adm/save_user:
     *   put:
     *     summary: Create or update user data
     *     tags:
     *       - Admin
     *     produces:
     *       - application/json
     *     security:
     *       - ApiKeyAuth: []
     *     requestBody:
     *       description: A JSON object for user information
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               roles:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     *       400:
     *         $ref: '#/components/responses/RequestError'
     *       403:
     *         $ref: '#/components/responses/Unauthorized'
     */
    this.router.put(`${this.path}/save_user`, admController.saveUser);
  }
}

export default AdmRoute;
