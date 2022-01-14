import {Request, Response} from 'express';

/**
 * List of handeled/allowed entity types. See '../models' dir.
 */
const allowedEntityTypes: string[] = [
  'user',
  'rule',
];

/**
 * Dynamically creates a model object based on entityName. See '../models' dir.
 * @param {string} entityName Entity name (e.g. user or rule)
 * @param {string} id Unique entity ID
 * @param {Object} data Entity info (in JSON format)
 */
async function createModelObject(entityName: string, id?: string, data?: Object) {
  if (! entityName || allowedEntityTypes.indexOf(entityName) < 0) {
    throw new Error(`Entity "${entityName}" is not allowed.`);
  }

  // Forming the file path to the model and escaping the file path
  const file = '../models/' + entityName.replace(/\W/g, '');
  const module = await import(file);

  return new module.default(id, data);
}

/**
 * Send responses in the standart format
 * @param {Response} res Response
 * @param {Object} data Data to return
 * @param {string} errorMessage Error message if there was an error
 */
function sendRes(res: Response, data?: Object, errorMessage?: string) {
  const resOject: any = {
    data: data || {},
  };
  if (errorMessage) {
    res.status(400);
    resOject.message = errorMessage || '';
  }

  res.send(resOject);
}

/**
 * Save entity to db (create/update)
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function save(req:Request, res:Response) {
  const id:string = req.params.id;
  const data:Object = req.body;

  try {
    const entity = await createModelObject(req.params.entity, id, data);
    await entity.save();
    sendRes(res);
  } catch (e: unknown) {
    const { message } = e as Error;
    sendRes(res, {}, message);
  }
}

/**
 * Update entity in db (proxy function)
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function update(req:Request, res:Response) {
  return await save(req, res);
}

/**
 * Create entity in db (proxy function)
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function create(req:Request, res:Response) {
  return await save(req, res);
}

/**
 * Get entity info
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function get(req:Request, res:Response) {
  const id:string = req.params.id;

  try {
    const entity = await createModelObject(req.params.entity, id);
    const entityInfo = await entity.get();
    sendRes(res, entityInfo);
  } catch (e: unknown) {
    const { message } = e as Error;
    sendRes(res, {}, message);
  }
}

/**
 * List entities
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function list(req:Request, res:Response) {
  try {
    const entity = await createModelObject(req.params.entity);
    sendRes(res, await entity.list());
  } catch (e: unknown) {
    const { message } = e as Error;
    sendRes(res, {}, message);
  }
}

/**
 * Delete entity
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function deleteEntity(req:Request, res:Response) {
  const id:string = req.params.id;

  try {
    const entity = await createModelObject(req.params.entity, id);
    await entity.deleteEntity();
    sendRes(res);
  } catch (e: unknown) {
    const { message } = e as Error;
    sendRes(res, {}, message);
  }
}

module.exports = {
  create, update, get, list, deleteEntity,
};