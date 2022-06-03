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
import { LoggingWinston } from '@google-cloud/logging-winston';
const { format, transports } = winston;

const logFormat = format.printf(
  (info) => `${info.timestamp} ${info.level} ${info.message} `
);

const getTransportsForEnv = () => {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    // for Prod add stackdriver logging
    const loggingWinston = new LoggingWinston();
    return [
      new transports.Console({
        format: format.combine(
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.json()
        ),
      }),
      loggingWinston,
    ];
  }
  // for all other envs
  return [
    new transports.Console({
      format: format.combine(
        format.colorize({ message: true, level: true }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat
      ),
    }),
  ];
};

const getLogLevel = (): string => {
  // when Log level is set override environment settings
  if (typeof process.env.LOG_LEVEL != 'undefined') {
    return process.env.LOG_LEVEL.toLowerCase();
  }
  if (process.env.NODE_ENV == 'production') {
    return 'info';
  }
  return 'debug';
};

export const logger = winston.createLogger({
  level: getLogLevel(),
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: getTransportsForEnv(),
  exitOnError: false,
});
