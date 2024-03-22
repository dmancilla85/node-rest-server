const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// https://github.com/winstonjs/winston#logging
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
const log_level = process.env.LOG_LEVEL || 'debug';
const log_path = process.env.REQUESTS_LOGS_PATH;

function formatParams(info) {
  const { timestamp, level, message, ...args } = info;
  const ts = timestamp.slice(0, 19).replace('T', ' ');

  return `${ts} ${level}: ${message} ${
    Object.keys(args).length ? JSON.stringify(args, '', '') : ''
  }`;
}

// https://github.com/winstonjs/winston/issues/1135
const developmentFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(formatParams)
);

const productionFormat = format.combine(
  format.timestamp(),
  format.align(),
  format.printf(formatParams)
);

let winstonLogger;

if (process.env.NODE_ENV !== 'production') {
  winstonLogger = createLogger({
    log_level,
    exitOnError: false,
    format: developmentFormat,
    transports: [
      new transports.DailyRotateFile({
        filename: `${log_path}/combined-%DATE%.log`,
        level: 'debug',
        datePattern: 'YYYYMMDD',
        maxSize: '10m',
        maxFiles: '14d',
        format: format.logstash(),
        handleExceptions: true,
      }),
      new transports.Console({
        handleExceptions: true,
      }),
    ],
  });
} else {
  winstonLogger = createLogger({
    log_level,
    format: productionFormat,
    transports: [
      new transports.DailyRotateFile({
        filename: `${log_path}/error-%DATE%.log`,
        level: 'error',
        datePattern: 'YYYYMMDD',
        maxSize: '10m',
        maxFiles: '14d',
        format: format.logstash(),
        handleExceptions: true,
      }),
      new transports.DailyRotateFile({
        filename: `${log_path}/combined-%DATE%.log`,
        level: 'info',
        datePattern: 'YYYYMMDD',
        maxSize: '10m',
        maxFiles: '14d',
        format: format.logstash(),
      }),
    ],
  });
}

module.exports = { winstonLogger };
