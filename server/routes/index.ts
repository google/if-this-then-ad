import {Request, Response, Router} from 'express';

// eslint-disable-next-line new-cap
const router = Router();

// Controllers
const ruleController = require('../controllers/rule');

// Routes: Rules
router.get('/api/rule/save', ruleController.save);
router.get('/api/rule/get/:id', ruleController.get);

// Default '/' route
router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});


export default router;

