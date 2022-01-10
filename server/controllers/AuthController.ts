import {Request, Response} from 'express';
import passport from 'passport';
import log from '../util/logger';

export const showLogin = (req: Request, res: Response) => {
    res.send('<a href="/auth/google" class="button">Sign in with Google</a>');
};

export const googleOAuthCallBack = (req: Request, res: Response) => {
    const authCode = req.query['code'];

    log.debug(' --------------------');
    log.debug(`Authorization Code : ${authCode}`);
    log.debug(' --------------------');

    passport.authenticate('google', {failureRedirect: '/auth/login'}),
        (req: Request, res: Response) => {
            res.redirect('/auth/done');
        };
};
