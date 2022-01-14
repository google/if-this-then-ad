import {Request, Response, Router} from 'express';
import app from '../app';

// eslint-disable-next-line new-cap
const router = Router();

// Load Controllers
const entityProxy = require('../controllers/entityProxy');

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