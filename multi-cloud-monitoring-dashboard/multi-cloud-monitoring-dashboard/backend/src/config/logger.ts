import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const rest = Object.keys(meta || {}).length ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} ${level}: ${stack ?? message}${rest}`;
        })
      )
    })
  ]
});