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
    }),
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

let prefix = '';
if ('DEMO_ENV_NAME' in process.env && process.env.DEMO_ENV_NAME) {
    prefix = process.env.DEMO_ENV_NAME.replace('/', '-') + ':';
}

app.use(
    session({
        store: new FirestoreStore({
            dataset: new Firestore(),
            kind: prefix + 'iftta-sessions',
        }),
        secret: process.env.SESSION_SECRET || 's9hp0VtUkd$FJM$T91lB',
        cookie: {
            secure: false,
            expires: cookieExpiresOn,
        },
        resave: false,
        saveUninitialized: true,
    }),
);

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const message = ` Url:${req.url} 
                      Method: ${req.method}
                      Params: ${JSON.stringify(req.params, null, 2)} 
                      Body: ${JSON.stringify(req.body, null, 2)}`;
    log.debug(message);
    next();
};

app.use(requestLogger);

app = PassportSetup.init(app);

app.use('/', router);

export default app;
