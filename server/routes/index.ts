import {Request, Response, Router} from 'express';
import {showLogin} from '../controllers/AuthController';
import pass from '../config/PassportSetup';
import passport from 'passport';

// eslint-disable-next-line new-cap
const router = Router();

// Controllers
const someController = require('../controllers/some');

// Auth routes
router.get('/auth/login', showLogin);
router.get('/auth/google',
    passport.authenticate('google',
        {scope: ['email', 'profile'],
          failureRedirect: '/auth/login'}));
router.get('/auth/oauthcallback',
    passport.authenticate('google',
        {failureRedirect: '/auth/login'}),
    (req:Request, res:Response) => {
      res.redirect('/auth/done');
    },
);
// protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);

router.get('/', (req: Request, res: Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});

export default router;
