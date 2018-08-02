import { Request, Response } from 'express';
import CrudController from '../../models/crud.controller';
import { ErrorMessages, ResponseError, ResponseOk } from '../../models/response.model';
import EmailRepository from './email.repository';

class EmailController extends CrudController {

  constructor() {
    super(EmailRepository);
  }

  listUnsent(req: Request, res: Response) {
    EmailRepository.listUnsent().then((items) => {
      new ResponseOk(res, items || []);

    }).catch((err) => {
      console.error('CRUD_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new EmailController;
