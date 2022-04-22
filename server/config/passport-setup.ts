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

import {log, date} from '@iftta/util';
import {Application, NextFunction, Request, Response} from 'express';
import passport from 'passport';
import GoogleStrategy from '../auth/google-strategy';
import {Collection} from '../models/fire-store-entity';
import {User} from '../models/user';
import Collections from '../services/collection-factory';
import Repository from '../services/repository-service';

const usersCollection = Collections.get(Collection.USERS);
const userRepo = new Repository<User>(usersCollection);

/**
 * Init passport.
 *
 * @param { Application } app
 * @return {any}
 */
export const init = (app: Application): any => {
    app = app.use(passport.initialize());
    app = app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser<any, any>((user, done) => {
        // puts the user object into req.user
        // NOTE: if session.secure = true and you are not on SSL
        // everything fails silently and user isnt set
        // and this method isnt getting called
        // https://stackoverflow.com/questions/11277779/passportjs-deserializeuser-never-called/23119369#23119369

        done(null, user);
    });

    GoogleStrategy.initialise(passport);
    log.info('Initialised Passport with Google strategy');
    return app;
};

/**
 * Checks if request is authenticated.
 *
 * @param { Request } req
 * @param { Response } res
 * @param { NextFunction } next
 * @return { any }
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authorizationHeader = req.headers.authorization || '';
    const accessToken = _extractAccessToken(authorizationHeader);
    // Allowing clients to authenticate via authorization headers.
    // at the end check if the cookies are valid and let the request through.
    log.debug(accessToken);

    if (process.env.NODE_ENV == 'production') {
        if (req.session['accessTokenIsValid']) {
            return next();
        }
    }
    
    try {
        const tokenResult = await _isValidAccessToken(accessToken || '');
        log.debug('Validity of the submitted token ' + tokenResult);
        req.session['accessTokenIsValid'] = tokenResult;
        if (tokenResult) {
            log.debug(`Token is valid ${tokenResult}`);
            return next();
        }

        // finally check if user object
        // was set as part of the cookie
        if (req.isAuthenticated()) {
            return next();
        }

        log.debug('failed auth');
        return next('Failed auth');
    } catch (err) {
        return next(err);
    }
};

/**
 * Checks if request is authorized.
 * @param { Request } req
 * @param { Response } res
 * @param { NextFunction } next
 * @return { any }
 */
export const isAuthorized = (
    req: Request,
    res: Response,
    next: NextFunction
): any => {
    // TODO: check for existence of the token
    // otherwise redirect to /api/auth/google
    return true;
};

/**
 * Extract Access Token from authorization header.
 *
 * @param {string} authHeader Auth Header
 * @returns {string}
 */
const _extractAccessToken = (authHeader: string): string | undefined => {
    const headerParts = authHeader.split(' ');

    if (headerParts.length == 2) {
        return headerParts[1];
    }
    return undefined;
};

/**
 * Check access token validity.
 *
 * @param { string } accessToken
 * @returns { boolean }
 */
const _isValidAccessToken = async (accessToken: string): Promise<boolean> => {
    try {
        const result: User[] = await userRepo.getBy(
            'token.access',
            accessToken
        );
        if (result.length > 0) {
            // ensure that the token isnt expired.
            const user: User = result[0];
            return date.isFuture(user.token.expiry);
        }
    } catch (err) {
        log.error(err);
    }
    return false;
};
