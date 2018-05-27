import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import UserRepository from './user.repository';

class UserController {
  constructor() { }

  get(req, res) {
    UserRepository.get().select('-password').then((users) => {
      new ResponseOk(res, users || []);

    }).catch((err) => {
      console.error('USER_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  getById(req, res) {
    const { id } = req.params;

    UserRepository.get(id).select('-password').then((user) => {
      if (user) {
        new ResponseOk(res, user);
      } else {
        new ResponseError(res, ErrorMessages.USER_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('USER_GET_BY_ID_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  create(req, res) {
    UserRepository.create(req.body).then((user) => {
      new ResponseOk(res, user, httpStatus.CREATED);

    }).catch((err) => {
      console.error('USER_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  update(req, res) {
    const { id } = req.params;

    UserRepository.update(id, req.body).then((user) => {
      if (user) {
        new ResponseOk(res, user);
      } else {
        new ResponseError(res, ErrorMessages.USER_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('USER_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  delete(req, res) {
    const { id } = req.params;

    UserRepository.delete(id).then((user) => {
      if (user) {
        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.USER_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('USER_DELETE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new UserController;
