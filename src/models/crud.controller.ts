import { Request, Response } from 'express';
import BaseRepository from './base.respository';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from './response.model';

export default class CrudController {
  private baseRepository: BaseRepository;

  constructor(baseRepository: BaseRepository) {
    this.baseRepository = baseRepository;
  }

  get(req: Request, res: Response) {
    this.baseRepository.get().then((items) => {
      new ResponseOk(res, items || []);

    }).catch((err) => {
      console.error('CRUD_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  getById(req: Request, res: Response) {
    const { id } = req.params;

    this.baseRepository.get(id).then((item) => {
      if (item) {
        new ResponseOk(res, item);
      } else {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('CRUD_GET_BY_ID_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  create(req: Request, res: Response) {
    this.baseRepository.create(req.body).then((item) => {
      new ResponseOk(res, item, httpStatus.CREATED);

    }).catch((err) => {
      console.error('CRUD_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  update(req: Request, res: Response) {
    const { id } = req.params;

    this.baseRepository.update(id, req.body).then((item) => {
      if (item) {
        new ResponseOk(res, item);
      } else {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('CRUD_UPDATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  delete(req: Request, res: Response) {
    const { id } = req.params;

    this.baseRepository.delete(id).then((item) => {
      if (item) {
        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('CRUD_DELETE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}
