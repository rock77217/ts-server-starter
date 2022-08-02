import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import hpp from "hpp";
import path from "path";
import { Routes } from "@interfaces/routes.interface";
import { NODE_ENV, PORT } from "@configs/settings";
import logMiddlewares from "@middleware/log.middlewares";
import errorMiddleware from "@middleware/error.middleware";
import notFoundMiddleware from "@middleware/notfound.middleware";

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port);
  }

  private initializeMiddlewares() {
    this.app.use(logMiddlewares);
    this.app.use(cors());
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(fileUpload());
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }
}

export default App;
