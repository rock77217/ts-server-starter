import { PORT } from "@/configs/settings";
import ExpressLog from "@/handlers/express_log.handler";
import { Routes } from "@/interfaces/routes.interface";
import errorMiddleware from "@/middleware/error.middleware";
import logMiddlewares from "@/middleware/log.middlewares";
import notFoundMiddleware from "@/middleware/notfound.middleware";
import saveResponseMiddleware from "@/middleware/save_response.middleware";
import swagger from "@/swagger";
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
import selfsigned from "selfsigned";

class App {
  public app: express.Application;

  constructor(routes: Routes[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    const privatePath = path.resolve(__dirname, "../ssl/private.key");
    const caPath = path.resolve(__dirname, "../ssl/intermediate.pem");
    const certificatePath = path.resolve(__dirname, "../ssl/certificate.pem");

    const selfsignedKey = selfsigned.generate(
      [
        { name: "countryName", value: "TW" },
        { name: "stateOrProvinceName", value: "Taipei" },
        { name: "organizationName", value: "MY" },
        { name: "organizationalUnitName", value: "MY" },
        { name: "commonName", value: "MY" },
      ],
      { algorithm: "sha256", days: 36500, keySize: 2048 }
    );
    https.createServer({
      key: fs.existsSync(privatePath) ? fs.readFileSync(privatePath, "utf8") : selfsignedKey.private,
      ca: fs.existsSync(caPath) ? fs.readFileSync(caPath, "utf8") : undefined,
      cert: fs.existsSync(certificatePath) ? fs.readFileSync(certificatePath, "utf8") : selfsignedKey.cert,
      secureProtocol: "TLSv1_2_method",
    }, this.app).listen(PORT || 3000);
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
    this.app.use(saveResponseMiddleware);
    // get ip from request
    this.app.set("trust proxy", true);
  }

  private initializeRoutes(routes: Routes[]) {
    this.app.all("*", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.method.toLowerCase() !== "get") res.locals.logId = await ExpressLog.create(req);
      next();
    });
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
