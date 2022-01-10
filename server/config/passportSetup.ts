import {Application, Request, Response, NextFunction} from 'express';
import GoogleStrategy from '../auth/GoogleStrategy';
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
        next: NextFunction): any {
            if (req.isAuthenticated()) {
                return next();
            }
            log.info('request not be authenticated, please login');
            return res.redirect('/auth/login');
    }

    /**
     * Checks if request is authorized.
     * @param { Request } req
     * @param { Response } res
     * @param { NextFunction } next
     * @return {any}
     */
    public isAuthorized(req: Request, res: Response, next: NextFunction): any {
        const provider = req.user?.tokenProvider;
        log.debug(req.user);
        const token = req.user?.authToken;
        log.debug(`is Authorized : ${token}`);

        if (token) {
            return next();
        } else {
            return res.redirect(`/auth/${provider}`);
        }
    }
}

export default new PassportSetup();
