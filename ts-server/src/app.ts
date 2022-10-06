import { NODE_ENV, PORT } from "@configs/settings";
import { Routes } from "@interfaces/routes.interface";
import errorMiddleware from "@middleware/error.middleware";
import logMiddlewares from "@middleware/log.middlewares";
import notFoundMiddleware from "@middleware/notfound.middleware";
import swagger from "./swagger";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import fs from "fs";
import helmet from "helmet";
import hpp from "hpp";
import https from "https";
import path from "path";

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
    const ssl = {
      key: fs.readFileSync(__dirname + "/../ssl/private.key", "utf8"),
      cert: fs.readFileSync(__dirname + "/../ssl/certificate.crt", "utf8"),
    };
    const serverHttps = https.createServer(ssl, this.app);
    serverHttps.listen(this.port);
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
    this.app.use('/swagger', swagger);
  }

  private initializeErrorHandling() {
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }
}

export default App;
