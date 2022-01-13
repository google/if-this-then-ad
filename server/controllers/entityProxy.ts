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
 * Save entity to db
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function create(req:Request, res:Response) {
  const id:string = 'UniqueID';
  const configuration:Object = {test: '123'};

  try {
    const entity = await createModelObject(req.params.entity, id, configuration);
    await entity.save();
    sendRes(res);
  } catch (e: unknown) {
    const { message } = e as Error;
    sendRes(res, {}, message);
  }
}

/**
 * Get rule info
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
 * List users
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

module.exports = {
  create, get, list,
};