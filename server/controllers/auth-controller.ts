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

import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { log } from '@iftta/util';

// TODO(jhoesel): move token refresh out of job runner.
import { refreshAccessToken } from '../auth/google-auth';

function encodeLoginStateFromRequest(req: Request) {
  return Buffer.from(
    JSON.stringify({
      returnTo: req.query.returnTo,
      clientUrl: req.query.clientUrl,
    })
  ).toString('base64');
}
function decodeLoginStateFromRequest(req: Request) {
  const parsed = JSON.parse(
    Buffer.from(req.query.state!.toString(), 'base64').toString()
  );
  return {
    returnTo: parsed['returnTo'] as string,
    clientUrl: parsed['clientUrl'] as string,
  };
}
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, token } = req.body;
    const newToken = await refreshAccessToken(userId, token);
    res.json(newToken);
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response) {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
}

export function googleLoginCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.debug('Google login called back.');
  passport.authenticate('google', {
    failureRedirect: '/api/auth/login',
  })(req, res, next);
}

export function googleLoginDone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.debug('Google login process done, redirecting client.');
  const { returnTo, clientUrl } = decodeLoginStateFromRequest(req);
  const userValue = encodeURIComponent(JSON.stringify(req.user) || '');
  res.redirect(`${clientUrl}/logged-in?returnTo=${returnTo}&user=${userValue}`);
}

export function login(req: Request, res: Response, next: NextFunction) {
  log.debug('Executing Google login.');
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    state: encodeLoginStateFromRequest(req),
  })(req, res, next);
}
