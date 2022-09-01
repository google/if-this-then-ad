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

import express, { Router } from 'express';
import * as AuthController from '../controllers/auth-controller';
import * as AccountController from '../controllers/account-controller';
import * as AgentsController from '../controllers/agents-controller';
import * as RulesController from '../controllers/rules-controller';
import path from 'path';
import passport from 'passport';
import { isAuthenticated } from '../auth/google-auth';

// eslint-disable-next-line new-cap
const router = Router();

// **************************
// * Authorization routes
// **************************
// App authorization routes
router.get('/api/auth/login', AuthController.login);
router.get('/api/auth/logout', AuthController.logout);
router.post('/api/auth/logout', AuthController.logout);
router.get(
  '/api/auth/oauthcallback',
  passport.authenticate('google', { failureRedirect: '/api/auth/login' }),
  AuthController.googleLoginDone
);
router.post('/api/auth/refresh', AuthController.refreshToken);

// **************************
// * API routes
// **************************

// Account routes
router.get('/api/accounts', isAuthenticated, AccountController.listAccounts);
router.get('/api/accounts/:id', isAuthenticated, AccountController.get);
router.post('/api/accounts', isAuthenticated, AccountController.create);
router.post('/api/accounts/:id', isAuthenticated, AccountController.update);
router.delete('/api/accounts/:id', isAuthenticated, AccountController.remove);
// User settings endpoint (save/update)
router.post(
  '/api/accounts/:userId/settings',
  isAuthenticated,
  AccountController.updateSettings
);

// Rules endpoints
router.post('/api/rules', isAuthenticated, RulesController.create);
router.get('/api/rules/run', RulesController.runAll);
router.get('/api/rules', isAuthenticated, RulesController.list);
router.get('/api/rules/:id', isAuthenticated, RulesController.get);
router.get('/api/rules/user/:id', isAuthenticated, RulesController.getByUser);
router.delete(
  '/api/rules/:userId/:id',
  isAuthenticated,
  RulesController.remove
);

router.get(
  '/api/agents/metadata',
  isAuthenticated,
  AgentsController.getAgentsMetadata
);

router.get(
  '/api/agents/:agent/list/:entityType',
  isAuthenticated,
  AgentsController.getAgentEntityList
);

/**
 * Depending on the env determine the location of static files.
 *
 * @returns {string} filePath
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
if (process.env.NODE_ENV !== 'development') {
  router.use('*', express.static(getStaticFilePath()));
}

export default router;
