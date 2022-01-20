/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

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
  if (process.env.LOG_LEVEL?.toUpperCase() == 'DEBUG') {
    // Create a basic console logger
    logger = winston.createLogger({
      level: 'debug',
      transports: [new winston.transports.Console()],
    });
  } else {
    logger = winston.createLogger({
      level: 'info',
      transports: [new winston.transports.Console()],
    });
  }
}

export default logger;
