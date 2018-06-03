import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import InvoiceRepository from './invoice.repository';

class InvoiceController {
  constructor() { }

  get(req, res) {
    InvoiceRepository.get().then((invoices) => {
      new ResponseOk(res, invoices || []);

    }).catch((err) => {
      console.error('INVOICE_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  getById(req, res) {
    const { id } = req.params;

    InvoiceRepository.get(id).then((invoice) => {
      if (invoice) {
        new ResponseOk(res, invoice);
      } else {
        new ResponseError(res, ErrorMessages.INVOICE_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('INVOICE_GET_BY_ID_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  create(req, res) {
    InvoiceRepository.create(req.body).then((invoice) => {
      new ResponseOk(res, invoice, httpStatus.CREATED);

    }).catch((err) => {
      console.error('INVOICE_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  update(req, res) {
    const { id } = req.params;

    InvoiceRepository.update(id, req.body).then((invoice) => {
      if (invoice) {
        new ResponseOk(res, invoice);
      } else {
        new ResponseError(res, ErrorMessages.INVOICE_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('INVOICE_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  delete(req, res) {
    const { id } = req.params;

    InvoiceRepository.delete(id).then((invoice) => {
      if (invoice) {
        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.INVOICE_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('INVOICE_DELETE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new InvoiceController;
