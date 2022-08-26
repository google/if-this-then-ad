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
import { logger } from '../util/logger';

// TODO(jhoesel): move token refresh out of job runner.
import { refreshAccessToken } from '../auth/google-auth';

/**
 * Encodes the login request parameters into a pass-through state variable for
 * the OAuth flow.
 * @param {Request} req the express request
 * @returns {string} the base-64 encoded state value
 */
function encodeLoginStateFromRequest(req: Request) {
  return Buffer.from(
    JSON.stringify({
      returnTo: req.query.returnTo,
      clientUrl: req.query.clientUrl,
    })
  ).toString('base64');
}

/**
 *
 * @param {Request} req the express request
 * @returns {{returnTo: string, clientUrl: string}} the decoded login state
 */
function decodeLoginStateFromRequest(req: Request) {
  const parsed = JSON.parse(
    Buffer.from(req.query.state!.toString(), 'base64').toString()
  );
  return {
    returnTo: parsed['returnTo'] as string,
    clientUrl: parsed['clientUrl'] as string,
  };
}

/**
 * Attempts an access token refresh.
 * @param {Request} req the express request
 * @param {Response} res the express response
 * @param {NextFunction} next the express next function
 */
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

/**
 * Performs a logout.
 * @param {Request} req the express request
 * @param {Response} res the express response
 */
export function logout(req: Request, res: Response) {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
}

/**
 * Handles the login callback from Google's OAuth flow.
 * @param {Request} req the express request
 * @param {Response} res the express response
 * @param {NextFunction} next the express next function
 */
export function googleLoginCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.debug('Google login called back.');
  passport.authenticate('google', {
    failureRedirect: '/api/auth/login',
  })(req, res, next);
}

/**
 * Handles the final leg of the OAuth flow and redirects the user's agent to
 * the final 'logged-in' page.
 * @param {Request} req the express request
 * @param {Response} res the express response
 */
export function googleLoginDone(req: Request, res: Response) {
  logger.debug('Google login process done, redirecting client.');
  const { returnTo, clientUrl } = decodeLoginStateFromRequest(req);
  const userValue = encodeURIComponent(JSON.stringify(req.user) || '');
  res.redirect(`${clientUrl}/login?returnTo=${returnTo}&user=${userValue}`);
}

/**
 * Starts the Google OAuth login flow.
 * @param {Request} req the express request
 * @param {Response} res the express response
 * @param {NextFunction} next the express next function
 */
export function login(req: Request, res: Response, next: NextFunction) {
  logger.debug('Executing Google login.');
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    state: encodeLoginStateFromRequest(req),
  })(req, res, next);
}
