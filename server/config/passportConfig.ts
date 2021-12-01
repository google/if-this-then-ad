import passport from 'passport';
import {Strategy, StrategyOptionsWithRequest} from 'passport-google-oauth2';
import {Request} from 'express';

const options : StrategyOptionsWithRequest = {
  clientID: `${process.env.GOOGLE_CLIENT_ID}`,
  clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true,
};

const verifyResponse = (req:Request,
    accessToken:string,
    refreshToken:string,
    profile:any, done:any) =>{
  console.log(req);
  console.log(accessToken);
  console.log(refreshToken);
};

passport.use(new Strategy(options, verifyResponse));
