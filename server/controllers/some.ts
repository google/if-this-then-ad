import {Request, Response} from 'express';

/**
 * Hello route
 * @param {Request} req
 * @param {Response}res
 */
function hello(req: Request, res: Response) {
  res.send('Some Controller');
}

module.exports = {
  hello,
};
