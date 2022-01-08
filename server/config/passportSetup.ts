import { Application } from "express";
import Google from "../auth/GoogleStrategy";
import passport from 'passport';

class PassportSetup {

    public init(app: any): any {

        console.log('Initialising passport ')
        app = app.use(passport.initialize())
        app = app.use(passport.session());

        passport.serializeUser(function(user, done){
            done(null, user);
        });

        passport.deserializeUser<any, any>((user, done) => {
            done(null, user)
        });

        Google.initialise(passport);
        return app;
    }

    public isAuthenticated(req, res, next): any {
        if (req.isAuthenticated()) {
            return next();
        }
        console.log('request not be authenticated, please login');
        return res.redirect('/auth/login');
    }

    public isAuthorized(req, res, next): any {
        const provider = req.path.split('/').slice(-1)[0];
        const token = req.user.tokens.find(token => token.kind === provider);
        if (token) {
            return next();
        } else {
            return res.redirect(`/auth/${provider}`);
        }
    }
}

export default new PassportSetup();