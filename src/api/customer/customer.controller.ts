import { Request, Response } from 'express';
import CrudController from '../../models/crud.controller';
import PostingType from '../../models/posting-type.enum';
import RecurrenceType from '../../models/recurrence-type.enum';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from '../../models/response.model';
import InvoiceRepository from '../invoice/invoice.repository';
import ServiceRepository from '../service/service.repository';
import CustomerRepository from './customer.repository';

class CustomerController extends CrudController {

  constructor() {
    super(CustomerRepository);
  }

  async firstCharge(req: Request, res: Response) {
    try {
      const customers = req.body as any[];
      if (customers && customers.length) {
        for (const customer of customers) {
          const newCustomer = await CustomerRepository.create({
            responsibleName: customer.responsibleName || customer.name,
            name:            customer.name || customer.responsibleName,
            invoiceMaturity: customer.invoiceMaturity || 25,
            documentNumber:  customer.documentNumber,
            documentType:    customer.documentType,
            emails:          customer.emails,
            phones:          customer.phones,
          });

          const customerId = newCustomer._id;
          for (const domain of customer.domains) {
            await ServiceRepository.create({
              _customerId: customerId,
              description: `Hospedagem + Email (${domain})`,
              amount: 34.9,
              recurrenceType: RecurrenceType.monthly,
              recurrenceInterval: 1,
              inactive: false
            });
          }

          const newInvoice = await CustomerRepository.generateFirstInvoice(customerId) as any;
          if (customer.postings && customer.postings.length) {
            for (const posting of customer.postings) {
              newInvoice.postings.push({
                type: PostingType.service,
                description: posting.description,
                amount: posting.amount,
              });
            }
          }

          await InvoiceRepository.closeOneInvoice(newInvoice);
        }
      }

      return new ResponseOk(res, null, httpStatus.NO_CONTENT);

    } catch (err) {
      console.error('CUSTOMER_FIRST_CHARGE', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
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
