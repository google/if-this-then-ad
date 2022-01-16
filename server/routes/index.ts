import {Request, Response, Router} from 'express';
import * as AuthController from '../controllers/AuthController';
import * as AccountController from '../controllers/AccountController'; 
import someController from '../controllers/some';
import pass from '../config/PassportSetup';
import passport from 'passport';


// eslint-disable-next-line new-cap
const router = Router();

// Load Controllers
const entityProxy = require('../controllers/entityProxy');

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
    passport.authenticate('google', {failureRedirect: '/api/auth/login'}),
    (req: Request, res: Response) => {
      res.redirect('/api/auth/done');
    },
);

router.get('/api/auth/done', AuthController.authDone)

// protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);
router.get('/api/test', someController.hello);
// Routes:
//  - API to access the entities from the storage
router.post('/api/:entity/create/:id', entityProxy.create);
router.put('/api/:entity/update/:id', entityProxy.update);
router.get('/api/:entity/get/:id', entityProxy.get);
router.delete('/api/:entity/delete/:id', entityProxy.deleteEntity);
router.get('/api/:entity/list', entityProxy.list);

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
