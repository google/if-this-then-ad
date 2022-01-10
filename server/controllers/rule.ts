import {Request, Response} from 'express';
import {Rule} from '../models/rule';

/**
 * Rule route
 * @param {Request} req
 * @param {Response}res
 */
function save(req:Request, res:Response) {
  const id:string = 'UniqueID';
  const configuration:Object = {test: '123'};

  const rule = new Rule(id, configuration);
  rule.save();

  res.send({success: true});
}

module.exports = {
  save,
};
