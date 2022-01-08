import { createLogger, transports, format } from 'winston';
import appRootPath from 'app-root-path';
import { TimestampOptions } from 'logform';
import LoggerDailyRotate from 'winston-daily-rotate-file';

interface TransformableInfo {
    level: string;
    message: string;
    [key: string]: any;
}

const timestampOption: TimestampOptions = { format: 'YYYY-MM-DD HH:mm:ss' };

const transportOption: transports.ConsoleTransportOptions = {
    level: 'silly',
    format: format.combine(
        format.label({ label: '[Aiko - Server]' }), // label option
        format.timestamp(timestampOption), // time stamp option
        format.colorize(), // colorize option
        format.printf((info: TransformableInfo) => {
            return `${info.timestamp} - ${info.level}:  ${info.label} /// ${info.message}`;
        }),
    ),
};

const loggingFileOption: LoggerDailyRotate.DailyRotateFileTransportOptions = {
    level: 'silly',
    format: format.combine(
        format.label({ label: '[Aiko - Request]' }), // label option
        format.timestamp(timestampOption),
        format.printf((info: TransformableInfo) => {
            return `${info.timestamp} - ${info.level}:  ${info.label} /// ${info.message}`;
        }),
    ),
    filename: `${appRootPath}/../../aiko-log-file/requests/%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
};

const requestLogger = createLogger({
    transports: [
        new transports.Console(transportOption),
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        new (require('winston-daily-rotate-file'))(loggingFileOption),
    ],
});

export default requestLogger;
