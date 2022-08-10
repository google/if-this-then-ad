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
import { NextFunction, Request, Response } from 'express';
import {
  Strategy,
  Profile,
  VerifyCallback,
  StrategyOptions,
} from 'passport-google-oauth20';
import { Collection } from '../models/fire-store-entity';
import { Token, User } from '../models/user';
import Collections from '../services/collection-factory';
import Repository from '../services/repository-service';
import date from 'date-fns';
import { logger } from '../util/logger';
import { AppError } from '../util/error';

const usersCollection = Collections.get(Collection.USERS);
const userRepo = new Repository<User>(usersCollection);

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ****************************************************************************
// Authentication
// ****************************************************************************

/**
 * Extracts the raw access token from a HTTP authorization header.
 */
function extractAccessTokenFromHeader(authorizationHeader: string) {
  return authorizationHeader?.split(' ')[1];
}

/**
 * Extracts the raw access token from a HTTP request.
 */
function extractAccessTokenFromRequest(req: Request) {
  const authorizationHeader = req.headers.authorization ?? '';
  return extractAccessTokenFromHeader(authorizationHeader);
}

/**
 * Express middleware function to validate access tokens sent to the API.
 */
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = extractAccessTokenFromRequest(req);
  logger.debug(`Authenticating via access token ${accessToken}.`);
  if (accessToken) {
    const [user] = await userRepo.getBy('token.access', accessToken);
    if (user) {
      logger.debug(`Found eligible user ${user.id}`);
      if (date.isFuture(user.token.expiry)) {
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
 * @returns {Promise<Token>}
 */
async function getNewAuthToken(refreshToken: string): Promise<Token> {
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

    const request = await axios.post(GOOGLE_TOKEN_URL, payload);

    if (request.status == 200) {
      const token: Token = {
        access: request.data.access_token,
        expiry: date.add(Date.now(), { seconds: request.data.expires_in }),
        refresh: refreshToken,
        type: request.data.token_type,
      };

      logger.info(`Obtained new access Token ${token.access}`);
      logger.info(`Token expires in ${request.data.expires_in}`);

      logger.debug(token);
      return token;
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
 */
export async function refreshTokensForUser(userId: string): Promise<Token> {
  try {
    const user: User = (await userRepo.get(userId)) as User;

    if (
      (user != null || user != 'undefined') &&
      date.isFuture(user.token.expiry)
    ) {
      logger.info(`Access token for user ${userId} is still valid`);
      return user.token;
    }
    logger.info(
      `Noticed expired access token for user ${userId} , refreshing...`
    );
    const refreshToken: string = user.token.refresh as string;
    const newToken: Token = await getNewAuthToken(refreshToken);

    user.token.access = newToken.access;
    user.token.expiry = newToken.expiry;
    user.token.scope = newToken.scope;

    await userRepo.update(userId, user);

    return user.token;
  } catch (err) {
    logger.error(['google-auth:refreshTokenForUser', err as string]);
    throw err;
  }
}

/**
 * Reissues a new token for the user, upon presentation of the old token.
 */
export async function refreshAccessToken(
  userId: string,
  accessToken: string
): Promise<Token> {
  if (!userId && !accessToken) {
    return Promise.reject(
      new Error('Both userId and expired access Token are required for renewal')
    );
  }

  try {
    const user: User = (await userRepo.get(userId)) as User;
    if (user.token.access == accessToken) {
      const token = await refreshTokensForUser(userId);
      delete token.refresh;
      return token;
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
 */
async function createUser(profile: Profile) {
  logger.debug('Initializing new user.');
  const profileData = profile._json;
  const userData: User = {
    profileId: profile.id,
    displayName: profile.displayName,
    givenName: profile.name?.givenName,
    familyName: profile.name?.familyName,
    email: profileData.email!,
    verified: profileData.email_verified === 'true',
    gender: 'unknown',
    profilePhoto: profileData.picture,
    locale: profileData.locale,
    token: {
      access: '<initial>',
      expiry: new Date(0),
      refresh: '<initial>',
      provider: profile.provider,
      type: 'Bearer',
    },
  };
  logger.debug(`User data from profile: ${JSON.stringify(userData, null, 2)}`);
  const userId = await userRepo.save(userData);
  logger.debug(`Stored user data with id: ${userId}`);

  const user = await userRepo.get(userId);
  if (!user) {
    throw new AppError('Could not create user entry', 500);
  }
  return user;
}

/**
 * Implements passport's verify callback.
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
  let [user] = await userRepo.getBy('profileId', profile.id);
  logger.debug(user);
  if (!user) {
    user = await createUser(profile);
  }

  user.token = Object.assign(user.token, {
    access: accessToken,
    refresh: refreshToken,
    expiry: date.add(Date.now(), { seconds: 3599 }),
  });

  await userRepo.update(user.id!, user);
  // Do not transfer refresh token back to client.
  delete user.token.refresh;
  return done(null, user, true);
}

/**
 * Creates a Google OAuth2.0 sign-in strategy.
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
