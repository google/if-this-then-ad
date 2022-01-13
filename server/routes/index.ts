import {Request, Response, Router} from 'express';
import app from '../app';

// eslint-disable-next-line new-cap
const router = Router();

// Load Controllers
const entityProxy = require('../controllers/entityProxy');

// Routes:
//  - API to access the entities from the storage
router.post('/api/:entity/create', entityProxy.create);
router.get('/api/:entity/list', entityProxy.list);
router.get('/api/:entity/get/:id', entityProxy.get);
//router.delete('/api/:entity/delete/:id', entityProxy.delete);
//router.patch('/api/:entity/update/:id', entityProxy.update);

// Default '/' route
router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});

export default router;