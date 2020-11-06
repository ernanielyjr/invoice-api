import { Request, Response } from 'express';
import CrudController from '../../models/crud.controller';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from '../../models/response.model';
import CustomerRepository from '../customer/customer.repository';
import EmailService from '../email/email.service';
import InvoiceRepository from './invoice.repository';

class InvoiceController extends CrudController {

  constructor() {
    super(InvoiceRepository);
  }

  async customerFirstInvoice(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      const customer = await CustomerRepository.get({ id: customerId });
      if (!customer) {
        console.error('CUSTOMER_NOT_FOUND', customerId);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      const customerInvoices = await InvoiceRepository.getByCustomer(customerId);
      if (customerInvoices && customerInvoices.length) {
        console.error('INVOICE_FIRST_ALREADY_EXISTS', customerId);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      const newInvoice = await CustomerRepository.generateFirstInvoice(customerId);

      return new ResponseOk(res, newInvoice);

    } catch (err) {
      console.error('INVOICE_GENERATE_FIRST', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async closeAllInvoices(req: Request, res: Response) {
    try {
      const { force } = req.query;
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      let monthToClose = month + 1;

      // TODO: change to close invoice 10 day before maturity
      let closeDate = new Date(year, month + 1, 0);
      if (force === 'true') {
        closeDate = new Date();
        monthToClose = month;
      }

      if (today.getTime() !== closeDate.getTime()) {
        console.log('ITS_NOT_THE_CLOSING_DAY');
        return new ResponseOk(res, null, httpStatus.NO_CONTENT);
      }

      const customersList = await CustomerRepository.get();

      if (!customersList || !customersList.length) {
        console.log('NO_CUSTOMERS');
        return new ResponseOk(res, null, httpStatus.NO_CONTENT);
      }

      const invoicesList = await InvoiceRepository.find({
        year, // WTF: bug
        month: monthToClose,
        closed: false
      });

      if (!invoicesList || !invoicesList.length) {
        console.log('NO_INVOICES_TO_CLOSE');
        return new ResponseOk(res, null, httpStatus.NO_CONTENT);
      }

      for (const invoice of invoicesList) {
        await InvoiceRepository.closeOneInvoice(invoice);
      }

      new ResponseOk(res, null);

    } catch (err) {
      console.error('INVOICE_CLOSE_ALL_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async resendInvoiceEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const invoice = await InvoiceRepository.get({ id });

      if (!invoice) {
        console.error('INVOICE_NOT_FOUND', id);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      if (!invoice.closed) {
        console.error('INVOICE_IS_OPEN', invoice);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      if (invoice.paid) {
        console.error('INVOICE_IS_OPEN', invoice);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      const customer = await CustomerRepository.get({ id: invoice._customerId });
      if (!customer) {
        console.error('CUSTOMER_NOT_FOUND', invoice._customerId);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      const invoiceDate = invoice.dueDate;
      invoiceDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (today > invoiceDate) {
        EmailService.invoiceAwaitingPayment(customer, invoice);

      } else {
        EmailService.invoiceClosed(customer, invoice);
      }

      return new ResponseOk(res, null, httpStatus.NO_CONTENT);

    } catch (err) {
      console.error('INVOICE_RESEND_EMAIL_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async closeInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const invoice = await InvoiceRepository.get({ id });

      if (!invoice) {
        console.error('INVOICE_NOT_FOUND', id);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      if (invoice.closed) {
        console.error('INVOICE_ALREADY_CLOSED', invoice);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      await InvoiceRepository.closeOneInvoice(invoice);

      return new ResponseOk(res, null, httpStatus.NO_CONTENT);

    } catch (err) {
      console.error('INVOICE_CLOSE_ONE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

}

export default new InvoiceController;
