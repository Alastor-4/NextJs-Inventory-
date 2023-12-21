import { createLogger, format, transports } from ("winston")
import DailyRotateFile from ("winston-daily-rotate-file")
import { Loggly } from ("winston-loggly-bulk")
import path from ("path")


const logTransports = []
//only when exists loggly account usage data
//tag: 'admin' for current app
if (process.env.LOGGLY_TOKEN && process.env.LOGGLY_SUBDOMAIN) {
    logTransports.push(
        new Loggly({
            token: process.env.LOGGLY_TOKEN,
            subdomain: process.env.LOGGLY_SUBDOMAIN,
            tags: ["admin", `env-${process.env.NODE_ENV}`],
            json: true,
        })
    )
}

//only for localhost
if (process.env.NEXTAUTH_URL === "http://localhost:3000/api/auth") {
    logTransports.push(
        new transports.DailyRotateFile({
            filename: path.resolve(__dirname, "../logs/events-%DATE%.log"),
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        })
    )

    logTransports.push(
        new transports.Console({
            level: "info",
            format: format.combine(format.timestamp(), format.colorize(), format.simple()),
        })
    )
}

export default createLogger({
    level: "info",
    transports: logTransports,
    exceptionHandlers: logTransports,
    rejectionHandlers: logTransports,
    format: format.json(),
})