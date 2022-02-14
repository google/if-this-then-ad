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

import { Request, Response, Router } from 'express';
import { AuthenticateOptionsGoogle } from 'passport-google-oauth20';
import * as AuthController from '../controllers/auth-controller';
import * as AccountController from '../controllers/account-controller';
import * as AgentsController from '../controllers/agents-controller';
import * as RulesController from '../controllers/rules-controller';
import * as JobController from '../controllers/jobs-controller';

import someController from '../controllers/some';
import pass from '../config/passport-setup';
import passport from 'passport';

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

router.get('/api/auth/login', AuthController.showLogin);
router.get('/api/auth/google', passport.authenticate('google', options));
router.get(
    '/api/auth/oauthcallback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/login',
        successRedirect: '/api/auth/done',
    }),
);

router.get('/api/auth/done', AuthController.authDone);
router.get('/api/auth/logout', AuthController.logout);
router.post('/api/auth/logout', AuthController.logout);
// Protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);

// Account routes
router.get('/api/accounts', AccountController.listAccounts);
router.get('/api/accounts/:id', AccountController.get);
router.post('/api/accounts', AccountController.create);
router.post('/api/accounts/:id', AccountController.update);
router.delete('/api/accounts/:id', AccountController.remove);

// Rules endpoints
router.post('/api/rules', RulesController.create);
router.get('/api/rules', RulesController.list);

// Job runner trigger endpoint
router.get('/api/jobs/execute', JobController.executeJobs);

<<<<<<< HEAD
// TODO: Debug Endpoint
router.get('/api/agents/dv360/fetch', someController.fetch);

=======
>>>>>>> main
router.get(
    '/api/agents/metadata',
    //pass.isAuthenticated,
    AgentsController.getAgentsMetadata,
);
router.get(
    '/api/agents/:agent/list/:entityType',
    //pass.isAuthenticated,
    AgentsController.getAgentEntityList,
);

// router.post('/api/agent-results', PubSubController.messageHandler);

// Default '/' route
router.get('/', (req: Request, res: Response) => {
    const name = process.env.NAME || 'World';
    res.send(`Hello ${name}! IFTTA`);
});

export default router;