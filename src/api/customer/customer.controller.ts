import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import CustomerRepository from './customer.repository';
import ServiceRepository from '../service/service.repository';
import InvoiceRepository from '../invoice/invoice.repository';

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

  listServices(req, res) {
    const { customerId } = req.params;

    ServiceRepository.listByCustomer(customerId).then((services) => {
      new ResponseOk(res, services || []);

    }).catch((err) => {
      console.error('SERVICES_LIST_BY_CUSTOMER_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  listInvoices(req, res) {
    const { customerId } = req.params;

    InvoiceRepository.getByCustomer(customerId).then((invoices) => {
      new ResponseOk(res, invoices || []);

    }).catch((err) => {
      console.error('INVOICES_LIST_BY_CUSTOMER_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  currentInvoice(req, res) {
    const { customerId } = req.params;
    const baseDate = new Date();
    const baseMonth = baseDate.getMonth() + 1;
    const baseYear = baseDate.getFullYear();

    InvoiceRepository.getByCompetenceDate(customerId, baseMonth, baseYear).then((currentInvoice) => {
      new ResponseOk(res, currentInvoice);

    }).catch((err) => {
      console.error('SERVICES_LIST_BY_CUSTOMER_ERROR', err, req.body);
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
