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

import express, {Request, Response, Router} from 'express';
import {AuthenticateOptionsGoogle} from 'passport-google-oauth20';
import * as AuthController from '../controllers/auth-controller';
import * as AccountController from '../controllers/account-controller';
import * as AgentsController from '../controllers/agents-controller';
import * as RulesController from '../controllers/rules-controller';
import * as JobController from '../controllers/jobs-controller';

import someController from '../controllers/some';
import * as pass from '../config/passport-setup';
import passport from 'passport';
import path from 'path';

// eslint-disable-next-line new-cap
const router = Router();

/**
 *  Auth options
 *  Important: accessType: Offline or you will not get a refresh token
 *  which we need to perform background work.
 */
const options: AuthenticateOptionsGoogle = {
    accessType: 'offline',
    prompt: 'consent',
};

router.get('/api/auth/login', AuthController.login);

router.get('/api/auth/google', (req, res, next) => {
    const state = {
        returnTo: req.query.returnTo,
        clientUrl: req.query.clientUrl,
    };

    const authenticator = passport.authenticate('google', {
        ...options,
        ...{state: Buffer.from(JSON.stringify(state)).toString('base64')},
    });

    authenticator(req, res, next);
});

router.get(
    '/api/auth/oauthcallback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/login',
    }),
    AuthController.authDone
);

router.get('/api/auth/logout', AuthController.logout);
router.post('/api/auth/logout', AuthController.logout);
router.post('/api/auth/refresh', AuthController.renewToken);
// Protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);

// Account routes
router.get(
    '/api/accounts',
    pass.isAuthenticated,
    AccountController.listAccounts
);
router.get('/api/accounts/:id', pass.isAuthenticated, AccountController.get);
router.post('/api/accounts', pass.isAuthenticated, AccountController.create);
router.post(
    '/api/accounts/:id',
    pass.isAuthenticated,
    AccountController.update
);
router.delete(
    '/api/accounts/:id',
    pass.isAuthenticated,
    AccountController.remove
);

// Rules endpoints
router.post('/api/rules', pass.isAuthenticated, RulesController.create);
router.get('/api/rules', pass.isAuthenticated, RulesController.list);
router.get('/api/rules/:id', pass.isAuthenticated, RulesController.get);
router.get(
    '/api/rules/user/:id',
    pass.isAuthenticated,
    RulesController.getByUser
);
router.delete(
    '/api/rules/:userId/:id',
    pass.isAuthenticated,
    RulesController.remove
);

// Job runner trigger endpoint
router.get('/api/jobs/execute', JobController.executeJobs);

// TODO: Debug Endpoint
router.get('/api/agents/dv360/fetch', someController.fetch);

router.get(
    '/api/agents/metadata',
    pass.isAuthenticated,
    AgentsController.getAgentsMetadata
);

router.get(
    '/api/agents/:agent/list/:entityType',
    //pass.isAuthenticated,
    AgentsController.getAgentEntityList
);

// router.post('/api/agent-results', PubSubController.messageHandler);

/**
 * Depending on the env determine the location of static files.
 * @returns filePath
 */
const getStaticFilePath = (): string => {
    let filePath = '';

    if (process.env.NODE_ENV == 'development') {
        filePath = path.join(__dirname, '../../../client/dist/client');
    } else {
        filePath = path.join(__dirname, '../', 'public');
    }

    return filePath;
};

// Serve static Angular build environment dependent.
router.use('*', express.static(getStaticFilePath()));

export default router;
