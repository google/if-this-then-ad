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

import axios from 'axios';
import { add as dateAdd, isFuture as dateIsFuture } from 'date-fns';
import { NextFunction, Request, Response } from 'express';
import {
  Profile,
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';
import { ModelSpec } from '../common/common';
import { Credentials, User } from '../common/user';
import { collectionService } from '../services/collections-service';
import { AppError } from '../util/error';
import { logger } from '../util/logger';

const users = collectionService.users;
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ****************************************************************************
// Authentication
// ****************************************************************************

/**
 * Extracts the raw access token from a HTTP authorization header.
 * @param {string} authorizationHeader the authorization header
 * @returns {string|undefined} the access token or undefined
 */
function extractAccessTokenFromHeader(authorizationHeader: string) {
  return authorizationHeader?.split(' ')[1];
}

/**
 * Extracts the raw access token from a HTTP request.
 * @param {Request} req the express request
 * @returns {string|undefined} the access token or undefined
 */
function extractAccessTokenFromRequest(req: Request) {
  const authorizationHeader = req.headers.authorization ?? '';
  return extractAccessTokenFromHeader(authorizationHeader);
}

/**
 * Express middleware function to validate access tokens sent to the API.
 * @param {Request} req the express request
 * @param {Response} res the express response
 * @param {NextFunction} next the express next function
 * @returns {void}
 */
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = extractAccessTokenFromRequest(req);
  logger.debug(`Authenticating via access token ${accessToken}.`);
  if (accessToken) {
    const user = await users.findByAccessToken(accessToken);
    if (user) {
      logger.debug(`Found eligible user ${user.id}`);
      if (dateIsFuture(user.credentials.expiry)) {
        logger.debug(`Eligible user's access token is valid.`);
        return next();
      }
    }
  }
  return next(new AppError('Not authenticated', 401));
}

// ****************************************************************************
// Token refresh
// ****************************************************************************

/**
 * Get new auth token.
 *
 * @param {string} refreshToken
 * @returns {Promise<Credentials>} the new credentials for the user
 */
async function getNewAuthToken(refreshToken: string): Promise<Credentials> {
  try {
    logger.debug(`Exchanging Refresh token  ${refreshToken} for Auth Token`);
    const grantType = 'refresh_token';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: grantType,
      refresh_token: refreshToken,
    };
    const now = new Date();
    const request = await axios.post(GOOGLE_TOKEN_URL, payload);

    if (request.status == 200) {
      const credenitals: Credentials = {
        accessToken: request.data.access_token,
        expiry: dateAdd(now, { seconds: request.data.expires_in }),
        refreshToken: request.data.refresh_token,
      };

      logger.info(`Obtained new access Token ${credenitals.accessToken}`);
      logger.info(`Token expires in ${request.data.expires_in}`);

      return credenitals;
    }
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
  return Promise.reject(
    new Error('Could not obtain token, check logs for errors')
  );
}

/**
 * Refresh tokens for user.
 *
 * For server-internal use only.
 * @param {string} userId the user ID
 * @returns {Promise<Credentials>} the new credentials for the user
 */
export async function refreshTokensForUser(
  userId: string
): Promise<Credentials> {
  try {
    const user = await users.get(userId);

    if (user) {
      if (dateIsFuture(user.credentials.expiry)) {
        logger.info(`Access token for user ${userId} is still valid`);
        return user.credentials;
      }
      logger.info(
        `Noticed expired access token for user ${userId} , refreshing...`
      );
      const refreshToken: string = user.credentials.refreshToken;
      const newCredentials = await getNewAuthToken(refreshToken);
      Object.assign(user.credentials, newCredentials);
      await users.update(userId, user);
      return user.credentials;
    }
    throw new AppError('Unknown user.', 401);
  } catch (err) {
    logger.error(['google-auth:refreshTokenForUser', err as string]);
    throw err;
  }
}

/**
 * Reissues a new token for the user, upon presentation of the old token.
 * @param {string} userId the user ID
 * @param {string} accessToken the user's current access token
 * @returns {Promise<Credentials>} the new credentials for the user
 */
export async function refreshAccessToken(
  userId: string,
  accessToken: string
): Promise<Credentials> {
  if (!userId && !accessToken) {
    return Promise.reject(
      new Error('Both userId and expired access Token are required for renewal')
    );
  }

  try {
    const user: User = (await users.get(userId)) as User;
    if (user?.credentials?.accessToken == accessToken) {
      const newCredentials = await refreshTokensForUser(userId);
      return newCredentials;
    }
    throw new Error('Refresh request denied');
  } catch (e) {
    logger.error(e);
    throw e;
  }
}

// ****************************************************************************
// Passport config
// ****************************************************************************

/**
 * Initializes a new user in the data store.
 * @param {Profile} profile the profile from which to create the user.
 */
async function createUser(profile: Profile) {
  logger.debug('Initializing new user.');
  const profileData = profile._json;
  const userData: ModelSpec<User> = {
    profileId: profile.id,
    displayName: profile.displayName,
    givenName: profile.name?.givenName,
    familyName: profile.name?.familyName,
    email: profileData.email!,
    verified: profileData.email_verified === 'true',
    gender: 'unknown',
    profilePhoto: profileData.picture,
    locale: profileData.locale,
    credentials: {
      accessToken: '<initial>',
      expiry: new Date(),
      refreshToken: '<initial>',
    },
    settings: {},
  };
  logger.debug(`User data from profile: ${JSON.stringify(userData, null, 2)}`);
  const user = await users.insert(userData);
  logger.debug(`Stored user data with id: ${user.id}`);

  if (!user) {
    throw new AppError('Could not create user entry', 500);
  }
  return user;
}

/**
 * Implements passport's verify callback.
 * @param {string} accessToken the user's access token
 * @param {string} refreshToken the user's refresh token
 * @param {Profile} profile the user's profile data
 * @param {VerifyCallback} done the callback to notify completion
 */
async function verify(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback
) {
  // this is the callback method called after successful authentication
  logger.debug(`Profile : ${JSON.stringify(profile, null, 2)}`);

  // Check if the user exists in db
  let [user] = await users.findWhere('profileId', profile.id);
  logger.debug(user);
  if (!user) {
    user = await createUser(profile);
  }

  user.credentials = Object.assign(user.credentials, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiry: dateAdd(Date.now(), { seconds: 3599 }),
  });

  await users.update(user.id!, user);
  // Do not transfer refresh token back to client.
  return done(null, user, true);
}

/**
 * Creates a Google OAuth2.0 sign-in strategy.
 * @returns {Strategy} the Google OAuth strategy.
 */
export function createGoogleStrategy() {
  if (typeof process.env.OAUTH_CALLBACK_URL === 'undefined') {
    throw new Error(
      'OAUTH_CALLBACK_URL undefined, it must be set as environment variable'
    );
  }
  logger.warn(
    `Set oauth callback URL to ${process.env.OAUTH_CALLBACK_URL}, adjust Authorized URLs in GCP client settings accordingly`
  );

  const strategyOptions: StrategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.OAUTH_CALLBACK_URL,
    scope: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/display-video',
      'https://www.googleapis.com/auth/adwords',
    ],
  };
  return new Strategy(strategyOptions, verify);
}
