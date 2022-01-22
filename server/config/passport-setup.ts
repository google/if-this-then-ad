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

import { Application, Request, Response, NextFunction } from 'express';
import GoogleStrategy from '../auth/google-strategy';
import passport from 'passport';
import log from '../util/logger';

/**
 * Passport Setup
 */
class PassportSetup {
    /**
     * Init passport
     * @param { Application } app
     * @return {any}
     */
    public init(app: Application): any {
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
        log.info('Initialised  Passport with Google strategy');
        return app;
    }
    /**
     * Checks if request is authenticated.
     * @param { Request } req
     * @param { Response } res
     * @param { NextFunction } next
     * @return {any}
     */
    public isAuthenticated(
        req: Request,
        res: Response,
        next: NextFunction
    ): any {
        if (req.isAuthenticated()) {
            return next();
        }
        log.info('request not be authenticated, please login');
        return res.redirect('/api/auth/login');
    }

    /**
     * Checks if request is authorized.
     * @param { Request } req
     * @param { Response } res
     * @param { NextFunction } next
     * @return {any}
     */
    public isAuthorized(req: Request, res: Response, next: NextFunction): any {
        // TODO: check for existence of the token
        // otherwise redirect to /api/auth/google
        return true;
    }
}

export default new PassportSetup();
