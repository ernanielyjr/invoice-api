import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import CustomerRepository from './customer.repository';

class CustomerController {
  constructor() { }

  get(req, res) {
    CustomerRepository.get().then((customers) => {
      new ResponseOk(res, customers || []);

    }).catch((err) => {
      console.error('CUSTOMER_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  getById(req, res) {
    const { id } = req.params;

    CustomerRepository.get(id).then((customer) => {
      if (customer) {
        new ResponseOk(res, customer);
      } else {
        new ResponseError(res, ErrorMessages.CUSTOMER_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('CUSTOMER_GET_BY_ID_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  create(req, res) {
    CustomerRepository.create(req.body).then((customer) => {
      new ResponseOk(res, customer, httpStatus.CREATED);

    }).catch((err) => {
      console.error('CUSTOMER_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  update(req, res) {
    const { id } = req.params;

    CustomerRepository.update(id, req.body).then((customer) => {
      if (customer) {
        new ResponseOk(res, customer);
      } else {
        new ResponseError(res, ErrorMessages.CUSTOMER_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('CUSTOMER_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  delete(req, res) {
    const { id } = req.params;

    CustomerRepository.delete(id).then((customer) => {
      if (customer) {
        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.CUSTOMER_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('CUSTOMER_DELETE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new CustomerController;
