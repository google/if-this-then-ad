import {Request, Response, Router} from 'express';

// eslint-disable-next-line new-cap
const router = Router();

// Controllers
const entityProxy = require('../controllers/entityProxy');

// Routes:
//  - API to access the entities from the storage
router.get('/api/:entity/create', entityProxy.create);
router.get('/api/:entity/list', entityProxy.list);
router.get('/api/:entity/get/:id', entityProxy.get);

// Default '/' route
router.get('/', (req:Request, res:Response) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}! IFTTA`);
});

export default router;