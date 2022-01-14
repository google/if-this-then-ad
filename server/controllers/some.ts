import {Request, Response} from 'express';


class SomeController {
  /**
    * Hello route
    * @param {Request} req
    * @param {Response}res
    */

  public async hello(req: Request, res: Response) {
    res.send('Some Controller');
  }
}

export default new SomeController();

