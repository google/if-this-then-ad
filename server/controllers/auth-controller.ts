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

import {Request, Response} from 'express';
import passport from 'passport';
import log from '../util/logger';

export const showLogin = (req: Request, res: Response) => {
  res.send('<a href="/api/auth/google" class="button">Sign in with Google</a>');
};

export const googleOAuthCallBack = (req: Request, res: Response) => {
  const authCode = req.query['code'];

  log.debug(' --------------------');
  log.debug(`Authorization Code : ${authCode}`);
  log.debug(' --------------------');

 passport.authenticate('google', { failureRedirect: '/api/auth/login', successRedirect: '/api/auth/done'});
};


export const authDone = (req:Request, res:Response) => {

    res.send('Login successful');
}