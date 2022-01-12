import {Request, Response} from 'express';
import {User} from '../models/user';

/**
 * Save rule to db
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function save(req:Request, res:Response) {
  const id:string = 'UniqueID';
  const configuration:Object = {test: '123'};

  const rule = new User(id, configuration);
  await rule.save();

  res.send({success: true});
}

/**
 * Get rule info
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function get(req:Request, res:Response) {
  const id:string = req.params.id;

  const user = new User(id);
  const userInfo = await user.get();

  res.send(userInfo);
}

/**
 * List users
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function list(req:Request, res:Response) {
  const user = new User();
  res.send(await user.list());
}

module.exports = {
  save, get, list,
};
