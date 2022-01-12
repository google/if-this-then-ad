import {Request, Response} from 'express';

const allowedEntityTypes: string[] = [
  'user',
  'rule',
];
async function createEntity(entityName: string, id?: string, data?: Object) {
  if (! entityName || allowedEntityTypes.indexOf(entityName) < 0) {
    throw new Error(`Entity "${entityName}" is not allowed.`);
  }

  // Forming the file path to the model and escaping the file path
  const file = '../models/' + entityName.replace(/\W/g, '');
  const module = await import(file);

  return new module.default(id, data);
}

/**
 * Save rule to db
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function create(req:Request, res:Response) {
  const id:string = 'UniqueID';
  const configuration:Object = {test: '123'};

  const entity = await createEntity(req.params.entity, id, configuration);
  await entity.save();

  res.send({success: true});
}

/**
 * Get rule info
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function get(req:Request, res:Response) {
  const id:string = req.params.id;

  const entity = await createEntity(req.params.entity, id);
  const entityInfo = await entity.get();

  res.send(entityInfo);
}

/**
 * List users
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function list(req:Request, res:Response) {
  const entity = await createEntity(req.params.entity);
  res.send(await entity.list());
}

module.exports = {
  create, get, list,
};