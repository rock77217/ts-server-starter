import morgan from "morgan";
import { Request, Response } from "express";
import { stream } from "@/utils/logger";

morgan.token("statusColor", (req: Request, res: Response) => {
  // get the status code if response written
  const status = (typeof res.headersSent !== "boolean" ? Boolean(res.header) : res.headersSent) ? res.statusCode : 500;

  // get status color
  const color =
    status >= 500
      ? 31 // red
      : status >= 400
      ? 33 // yellow
      : status >= 300
      ? 36 // cyan
      : status >= 200
      ? 32 // green
      : 0; // no color

  return "\x1b[" + color + "m" + status + "\x1b[0m";
});

const logMiddlewares = morgan("\x1b[33m:method\x1b[0m \x1b[36m:url\x1b[0m :statusColor :remote-addr :response-time ms - :res[content-length]", {
  skip: (req, _) => req.url === "/",
  stream,
});

export default logMiddlewares;
