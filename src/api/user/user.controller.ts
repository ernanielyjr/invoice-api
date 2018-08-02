import { Request, Response } from 'express';
import CrudController from '../../models/crud.controller';
import { ErrorMessages, ResponseError, ResponseOk } from '../../models/response.model';
import UserRepository from './user.repository';

class UserController extends CrudController {

  constructor() {
    super(UserRepository);
  }

}

export default new UserController;
