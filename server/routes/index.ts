
import {Request, Response, Router} from 'express';
// eslint-disable-next-line new-cap
const router = Router();
const path = require('path');

// Controllers
const someController = require('../controllers/some');

// Routes
router.get('/api/some', someController.hello);

router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! For Max and Kevin :-)`);
});

router.use('*', (req:Request, res:Response) => {
  res.sendFile(path.join(__dirname, '../', 'static', 'index.html'));
});

export default router;

