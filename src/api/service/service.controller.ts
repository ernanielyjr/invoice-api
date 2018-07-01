import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import ServiceRepository from './service.repository';

class ServiceController {
  constructor() { }

  get(req, res) {
    ServiceRepository.get().then((services) => {
      new ResponseOk(res, services || []);

    }).catch((err) => {
      console.error('SERVICE_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  getById(req, res) {
    const { id } = req.params;

    ServiceRepository.get(id).then((service) => {
      if (service) {
        new ResponseOk(res, service);
      } else {
        new ResponseError(res, ErrorMessages.SERVICE_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('SERVICE_GET_BY_ID_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  create(req, res) {
    ServiceRepository.create(req.body).then((service) => {
      new ResponseOk(res, service, httpStatus.CREATED);

    }).catch((err) => {
      console.error('SERVICE_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  update(req, res) {
    const { id } = req.params;

    ServiceRepository.update(id, req.body).then((service) => {
      if (service) {
        new ResponseOk(res, service);
      } else {
        new ResponseError(res, ErrorMessages.SERVICE_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('SERVICE_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  delete(req, res) {
    const { id } = req.params;

    ServiceRepository.delete(id).then((service) => {
      if (service) {
        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.SERVICE_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('SERVICE_DELETE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new ServiceController;
