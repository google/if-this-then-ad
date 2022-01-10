import {Request, Response} from 'express';
import {Rule} from '../models/rule';

/**
 * Save rule to db
 * @param {Request} req Request
 * @param {Response}res Response
 */
async function save(req:Request, res:Response) {
  const id:string = 'UniqueID';
  const configuration:Object = {test: '123'};

  const rule = new Rule(id, configuration);
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

  const rule = new Rule(id);
  const ruleInfo = await rule.get();

  res.send(ruleInfo);
}

module.exports = {
  save, get,
};
