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

// Load environment variables first
import env from 'dotenv';
import { log } from '@iftta/util';

const envConfig = env.config();
if (envConfig.error || envConfig.parsed == null) {
  log.error('Error loading configuration from .env file');
}

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import router from './routes';
import bodyParser from 'body-parser';
import * as PassportSetup from './config/passport-setup';
import { Collection } from './models/fire-store-entity';
const { Firestore } = require('@google-cloud/firestore');
const { FirestoreStore } = require('@google-cloud/connect-firestore');

let app = express();

log.info(`LOG LEVEL SETTING : ${process.env.LOG_LEVEL}`);
log.debug({ ...process.env });
log.debug('-------------------------------END CONFIGURATION----------------');
const PORT = process.env.PORT || 8080;
app.set('PORT', PORT);
/**
 * Express configuration
 */

// Explicitly setting CORS options
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
    preflightContinue: true,
    optionsSuccessStatus: 204,
  })
);
// Static assets & Frontend files
app.use(express.static(path.join(__dirname, './public')));
app.use(express.json());

// Process any request body as JSON, throw error if JSON is not correct
app.use(bodyParser.json({ type: '*/*' }));
app.use(express.urlencoded({ extended: true }));

// Cookie settings
const now = new Date().getTime();
// Setting session time to match access Token TTL
const interval = 3600 * 1 * 1000;
const cookieExpiresOn = new Date(now + interval);
log.debug(`Cookie expires on: ${cookieExpiresOn}`);

app.use(
  session({
    store: new FirestoreStore({
      dataset: new Firestore(),
      kind: Collection.SESSIONS,
    }),
    secret: process.env.SESSION_SECRET || 's9hp0VtUkd$FJM$T91lB',
    cookie: {
      secure: false,
      expires: cookieExpiresOn,
    },
    resave: false,
    saveUninitialized: true,
  })
);

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = ` Url:${req.url} 
                      Method: ${req.method}
                      Params: ${JSON.stringify(req.params, null, 2)} 
                      Body: ${JSON.stringify(req.body, null, 2)}`;
  log.debug(message);
  next();
};

app.use(requestLogger);

// Prevent app from crashing if some oauthcallback env variable is not set.
try {
  app = PassportSetup.init(app);
} catch (err) {
  log.error(err);
}

app.use('/', router);

/**
 * Last layer to handle errors thrown by API, prevents some routes
 * to throw 500 errors which are caused by missing auth token.
 *
 * @param {string} err Error message
 * @param {Request} req Request
 * @param {Resonse} res Response
 * @returns {Response}
 */
const errorHandler = (err: string, req: Request, res: Response) => {
  if (err == 'Failed auth') {
    return res.status(401).json({ error: err });
  }
  return res.status(500);
};

app.use(errorHandler);

export default app;
