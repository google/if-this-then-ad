import { Request, Response } from 'express'
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import {Rule} from '../models/rule'
import { Collection } from '../models/fire-store-entity';

const rulesCollection = Collections.get(Collection.RULES);
const repo = new Repository<Rule>(rulesCollection);
/**
 * Endpoint to enable creation of rules
 * @param {Request} req
 * @param {Response} res
 */
export const create = async (req: Request, res: Response) => {

}

export const list = async (req:Request, res:Response) => {

    res.json({"all-the": "rules here"});
}