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