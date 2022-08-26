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
import { logger } from './util/logger';

const envConfig = env.config();
if (envConfig.error || envConfig.parsed == null) {
  logger.error('Error loading configuration from .env file');
}

import { FirestoreStore } from '@google-cloud/connect-firestore';
import { Firestore } from '@google-cloud/firestore';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { createGoogleStrategy } from './auth/google-auth';
import { User } from './common/user';
import router from './routes';
import { handleGenericError } from './util/error';

const app = express();

logger.info(`LOG LEVEL SETTING : ${process.env.LOG_LEVEL}`);
logger.debug({ ...process.env });
logger.debug(
  '-------------------------------END CONFIGURATION----------------'
);
const PORT = process.env.PORT || 8080;
app.set('PORT', PORT);
/**
 * Express configuration
 */

// Configure CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
    preflightContinue: true,
    optionsSuccessStatus: 204,
  })
);
// Configure static assets & Frontend files
app.use(express.static(path.join(__dirname, './public')));
app.use(express.json());

// Configure app to process any request body as JSON and throw error if JSON is
// not valid
app.use(bodyParser.json({ type: '*/*' }));
app.use(express.urlencoded({ extended: true }));

// Configure sessions
// TDOD(jhoesel): Check if session cookie can live longer than access-token
const SESSION_COOKIE_MAX_AGE = 3600000;
app.use(
  session({
    store: new FirestoreStore({
      dataset: new Firestore(),
      kind: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 's9hp0VtUkd$FJM$T91lB',
    cookie: {
      secure: process.env.NODE_ENV !== 'development',
      maxAge: SESSION_COOKIE_MAX_AGE,
    },
    resave: false,
    saveUninitialized: true,
  })
);

// Configure request logger
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = ` Url:${req.url} 
                      Method: ${req.method}
                      Params: ${JSON.stringify(req.params, null, 2)} 
                      Body: ${JSON.stringify(req.body, null, 2)}`;
  logger.debug(message);
  next();
};
app.use(requestLogger);

// Initialize passport for app login
try {
  passport.use(createGoogleStrategy());
  // TODO(jhoesel): Reduce user properties stored in session
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser<User>((user, done) => done(null, user));

  app.use(passport.initialize());
  app.use(passport.session());
} catch (err) {
  logger.error(err);
}

// Configure routes
app.use('/', router);

// Configure error handlers (always do last)
// Register generic error handler for anything uncaught
app.use(handleGenericError);

export default app;
