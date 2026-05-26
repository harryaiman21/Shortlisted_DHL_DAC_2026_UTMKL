import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'resobot-api' },
    transports: [
        // Write all errors to error.log
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs (info, warning, error) to combined.log
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// If we are not in production, also log to the console with nice colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, stack }) => {
                if (stack) {
                    return `${timestamp} ${level}: ${message}\n${stack}`;
                }
                return `${timestamp} ${level}: ${message}`;
            })
        )
    }));
}

export default logger;