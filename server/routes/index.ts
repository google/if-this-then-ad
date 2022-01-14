import {Request, Response, Router} from 'express';
import {showLogin} from '../controllers/AuthController';
import someController from '../controllers/some';
import pass from '../config/PassportSetup';
import passport from 'passport';


// eslint-disable-next-line new-cap
const router = Router();

// Load Controllers
const entityProxy = require('../controllers/entityProxy');

// Auth routes
router.get('/auth/login', showLogin);
router.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['email', 'profile'],
      failureRedirect: '/auth/login',
    }),
);
router.get(
    '/auth/oauthcallback',
    passport.authenticate('google', {failureRedirect: '/auth/login'}),
    (req: Request, res: Response) => {
      res.redirect('/auth/done');
    },
);
// protected route
router.get('/api/account', pass.isAuthenticated, someController.hello);
// Routes:
//  - API to access the entities from the storage
router.post('/api/:entity/create/:id', entityProxy.create);
router.put('/api/:entity/update/:id', entityProxy.update);
router.get('/api/:entity/get/:id', entityProxy.get);
router.delete('/api/:entity/delete/:id', entityProxy.deleteEntity);
router.get('/api/:entity/list', entityProxy.list);

// Default '/' route
router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});

export default router;
