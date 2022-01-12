import {Request, Response, Router} from 'express';

// eslint-disable-next-line new-cap
const router = Router();

// Controllers
const ruleController = require('../controllers/rule');
const userController = require('../controllers/user');

// Routes:
//  - Rules
router.get('/api/rule/save', ruleController.save);
router.get('/api/rule/get/:id', ruleController.get);
//  - Users
router.get('/api/user/save', userController.save);
router.get('/api/user/get/:id', userController.get);
router.get('/api/user/list', userController.list);

// Default '/' route
router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});


export default router;

