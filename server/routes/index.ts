import {Request, Response, Router} from 'express';
import * as AuthController from '../controllers/auth-controller';
import * as AccountController from '../controllers/account-controller'; 
import someController from '../controllers/some';
import pass from '../config/passport-setup';
import passport from 'passport';

// eslint-disable-next-line new-cap
const router = Router();

// Auth routes
router.get('/api/auth/login', AuthController.showLogin);
router.get(
    '/api/auth/google',
    passport.authenticate('google', {
      scope: ['email', 'profile'],
      failureRedirect: '/api/auth/login',
    }),
);
router.get(
    '/api/auth/oauthcallback',
    passport.authenticate('google', { failureRedirect: '/api/auth/login', successRedirect: '/api/auth/done'})
);

router.get('/api/auth/done', AuthController.authDone)

// protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);
router.get('/api/test', someController.hello);


// Account routes
router.get('/api/accounts', AccountController.listAccounts);
router.get('/api/accounts/:id', AccountController.get);
router.post('/api/accounts', AccountController.create);
router.post('/api/accounts/:id', AccountController.update);
router.delete('/api/accounts/:id', AccountController.remove);

// Default '/' route
router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});

export default router;
