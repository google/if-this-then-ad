
import { Request, Response } from 'express';
import passport from 'passport';
import env from 'dotenv';

export const showLogin = (req: Request, res: Response) => {
    res.send('<a href="/auth/google" class="button">Sign in with Google</a>');
};

export const googleOAuthCallBack = (req: Request, res:Response) => {
    const authCode = req.query['code']; 
    console.log('Called back')
    console.log(' --------------------')
    console.log(authCode);
    console.log(' --------------------')

    passport.authenticate('google', {failureRedirect: '/auth/login'}), (req:Request, res:Response) =>{

        console.log('auth done... ')
        res.redirect('/auth/done');
    };
    // res.send("Called back");
}