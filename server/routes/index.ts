
import {Request, Response, Router} from 'express';

// eslint-disable-next-line new-cap
const router = Router();

// Controllers
const someController = require('../controllers/some');

// Routes
router.get('/api/some', someController.hello);

router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! For Max and Kevin :-)`);
});


export default router;

