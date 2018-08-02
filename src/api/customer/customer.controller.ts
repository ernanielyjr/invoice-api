import { Request, Response } from 'express';
import CrudController from '../../models/crud.controller';
import { ErrorMessages, ResponseError, ResponseOk } from '../../models/response.model';
import InvoiceRepository from '../invoice/invoice.repository';
import ServiceRepository from '../service/service.repository';
import CustomerRepository from './customer.repository';

class CustomerController extends CrudController {

  constructor() {
    super(CustomerRepository);
  }

  listServices(req: Request, res: Response) {
    const { id } = req.params;

    ServiceRepository.listByCustomer(id).then((services) => {
      new ResponseOk(res, services || []);

    }).catch((err) => {
      console.error('SERVICES_LIST_BY_CUSTOMER_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  listInvoices(req: Request, res: Response) {
    const { id } = req.params;

    InvoiceRepository.getByCustomer(id).then((invoices) => {
      new ResponseOk(res, invoices || []);

    }).catch((err) => {
      console.error('INVOICES_LIST_BY_CUSTOMER_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  currentInvoice(req: Request, res: Response) {
    const { id } = req.params;
    const baseDate = new Date();
    const baseMonth = baseDate.getMonth() + 1;
    const baseYear = baseDate.getFullYear();

    InvoiceRepository.getByCompetenceDate(id, baseMonth, baseYear).then((currentInvoice) => {
      new ResponseOk(res, currentInvoice);

    }).catch((err) => {
      console.error('SERVICES_LIST_BY_CUSTOMER_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new CustomerController;
