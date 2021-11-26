import winston from 'winston';

// Imports the Google Cloud client library for Winston
import {LoggingWinston} from '@google-cloud/logging-winston';

let logger: winston.Logger;

if (process.env.NODE_ENV === 'production') {
  // Create a Winston logger that streams to Stackdriver Logging
  // Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
  const loggingWinston = new LoggingWinston();
  logger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console(),
      // Add Stackdriver Logging
      loggingWinston,
    ],
  });
} else {
  // Create a basic console logger
  logger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console(),
    ],
  });
}

export default logger;
