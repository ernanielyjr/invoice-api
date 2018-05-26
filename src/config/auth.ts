import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import Config from '../config/configs';

class Auth {

  constructor() { }

  validate(req: Request, res: Response, next: NextFunction) {
    const token: string = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, Config.secret, (err, decoded) => {
        if (err) {
          res.status(401).json({
            // TODO: Criar objeto de erro
            success: false,
            message: '401 - Unauthorized'
          });
        } else {
          next();
        }
      });

    } else {
      res.status(403).send({
        // TODO: Criar objeto de erro
        success: false,
        message: '403 - Forbidden'
      });
    }
  }

}

export default new Auth;
