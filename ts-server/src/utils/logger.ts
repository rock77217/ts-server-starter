import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import { LOG_DIR } from "@configs/settings";
import { isEmpty } from "@utils/util";

const logDir: string = LOG_DIR && !isEmpty(LOG_DIR) ? LOG_DIR : join(__dirname, "../../logs");
const globalLevel = process.env.NODE_ENV === "development" ? "debug" : "http";

if (process.env.NODE_APP_INSTANCE === "0" && !existsSync(logDir)) {
  mkdirSync(logDir);
}

const alignColorsAndTime = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DDTHH:mm:ss",
  }),
  winston.format.printf((info) => `${info.timestamp} [${process.env.NODE_APP_INSTANCE}] ${info.level} ${info.message}`)
);

const logger = winston.createLogger({
  level: globalLevel,
  format: winston.format.combine(
    winston.format((info) => {
      info.level = info.level.toUpperCase().padEnd(5);
      return info;
    })(),
    winston.format.colorize(),
    alignColorsAndTime
  ),
  transports: [
    new winstonDaily({
      datePattern: "YYYY-MM-DD",
      dirname: logDir, // log file /logs/debug/*.log in save
      filename: `%DATE%.log`,
      maxFiles: "90d", // 30 Days saved
      handleExceptions: true,
      json: false,
    }),
    new (winston.transports.DailyRotateFile)({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: "%DATE%.error.log",
      maxFiles: "90d",
      createSymlink: true,
      symlinkName: 'nft-service-error.log',
      handleExceptions: true,
      json: false,
    }),
    new winston.transports.Console(),
  ],
});

const stream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf("\n")));
  },
};

export { logger, stream };
