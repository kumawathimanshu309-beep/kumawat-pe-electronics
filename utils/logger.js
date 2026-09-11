const winston = require('winston');
const path = require('path');
const fs = require('fs');

const isVercel = !!process.env.VERCEL || process.env.NOW_BUILD === '1';

const transports = [];

if (isVercel) {
  // On Vercel serverless runtime, send logs directly to stdout/stderr via Console
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`)
      )
    })
  );
} else {
  // Local development file logging
  const logDir = path.join(__dirname, '../logs');
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const DailyRotateFile = require('winston-daily-rotate-file');
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d',
        maxSize: '20m'
      }),
      new DailyRotateFile({
        filename: path.join(logDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        maxSize: '20m'
      })
    );
  } catch (err) {
    transports.push(new winston.transports.Console());
  }

  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`)
        )
      })
    );
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});

module.exports = logger;
