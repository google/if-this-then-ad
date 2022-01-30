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
import * as AuthController from '../controllers/auth-controller';
import * as AccountController from '../controllers/account-controller';
import * as MetadataController from '../controllers/metadata-controller'; 
import * as RulesController from '../controllers/rules-controller'; 

import someController from '../controllers/some';
import pass from '../config/passport-setup';
import passport from 'passport';
import * as JobController from '../controllers/jobs-controller'; 

// eslint-disable-next-line new-cap
const router = Router();

// Auth routes
router.get('/api/auth/login', AuthController.showLogin);
router.get(
    '/api/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        failureRedirect: '/api/auth/login',
    })
);
router.get(
    '/api/auth/oauthcallback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/login',
        successRedirect: '/api/auth/done',
    })
);

router.get('/api/auth/done', AuthController.authDone);
router.post('/api/auth/logout', AuthController.logout);

// protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);
router.get('/api/test', someController.hello);

// Account routes
router.get('/api/accounts', AccountController.listAccounts);
router.get('/api/accounts/:id', AccountController.get);
router.post('/api/accounts', AccountController.create);
router.post('/api/accounts/:id', AccountController.update);
router.delete('/api/accounts/:id', AccountController.remove);


// Rules endpoints 
router.post('/api/rules', RulesController.create); 
router.get('/api/rules', RulesController.list)


// Job runner trigger endpoint
router.get('/api/jobs/execute', JobController.executeJobs); 


// expose available metadata to the UI. 
router.get('/api/agents/metadata', MetadataController.getAgentMetadata); 
// router.post('/api/agent-results', PubSubController.messageHandler); 


// Default '/' route
router.get('/', (req: Request, res: Response) => {
    const name = process.env.NAME || 'World';
    res.send(`Hello ${name}! IFTTA`);
});

export default router;
