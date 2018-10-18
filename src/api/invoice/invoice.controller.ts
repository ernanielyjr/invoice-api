import { Request, Response } from 'express';
import CrudController from '../../models/crud.controller';
import PostingType from '../../models/posting-type.enum';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from '../../models/response.model';
import CustomerRepository from '../customer/customer.repository';
import EmailService from '../email/email.service';
import ServiceRepository from '../service/service.repository';
import InvoiceRepository from './invoice.repository';

class InvoiceController extends CrudController {

  constructor() {
    super(InvoiceRepository);
  }

  private generateNextInvoice(year: number, month: number, customerId: string, amount: number) {
    return new Promise(async (resolve, reject) => {

      const nextInvoiceDate = new Date(year, month, 1);
      const nextInvoice = {
        month: nextInvoiceDate.getMonth() + 1,
        year: nextInvoiceDate.getFullYear(),
        _customerId: customerId,
        closed: false,
        postings: []
      };

      nextInvoice.postings.push({
        amount,
        type: PostingType.balance,
        description: 'Saldo da Fatura Anterior',
      });

      const customerServices = await ServiceRepository.find({
        _customerId: customerId,
        inactive: false
      });

      customerServices.forEach((service) => {
        // TODO: check recurrency
        nextInvoice.postings.push({
          _serviceId: service._id,
          type: PostingType.service,
          description: service.description,
          amount: service.amount,
        });
      });

      try {
        const newInvoice = await InvoiceRepository.create(nextInvoice);
        resolve(newInvoice);

      } catch (err) {
        console.error('INVOICE_OPEN_ERROR', err, nextInvoice);
        reject(nextInvoice);
      }
    });
  }

  async customerFirstInvoice(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const { month, year } = req.query;

      const customerInvoices = await InvoiceRepository.getByCustomer(customerId);
      if (customerInvoices && customerInvoices.length) {
        console.error('INVOICE_FIRST_ALREADY_EXISTS', customerId);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      const today = new Date();
      const baseYear = year || today.getFullYear();
      const baseMonth = month || (today.getMonth() - 1);

      const customer = await CustomerRepository.get(customerId);

      if (!customer) {
        console.error('CUSTOMER_NOT_FOUND', customerId);
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      const newInvoice = await this.generateNextInvoice(baseYear, baseMonth, customerId, 0);
      return new ResponseOk(res, newInvoice);

    } catch (err) {
      console.error('INVOICE_GENERATE_FIRST', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async closeAllInvoices(req: Request, res: Response) {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();

      // TODO: change to close invoice 10 day before maturity
      const closeDate = new Date(year, month + 1, 0);
      // FIXME: fazer uma forma de forçar o fechamento

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
        year,
        month: month + 1,
        closed: false
      });

      if (!invoicesList || !invoicesList.length) {
        console.log('NO_INVOICES_TO_CLOSE');
        return new ResponseOk(res, null, httpStatus.NO_CONTENT);
      }

      const response = {
        closed: [],
        opened: [],
        closeError: [],
        openError: [],
      };

      for (const invoice of invoicesList) {
        const totalIncome = invoice.postings
          .filter(posting => posting.amount > 0 && posting.type !== PostingType.balance)
          .reduce((sum, posting) => sum + posting.amount, 0);

        let previousBalance = invoice.postings
          .filter(posting => posting.type === PostingType.balance)
          .reduce((sum, posting) => sum + posting.amount, 0);

        previousBalance = totalIncome + previousBalance;

        if (previousBalance < 0) {
          let charges = Math.round((previousBalance * (0.02 + 0.01)) * 100) / 100;
          if (charges === 0) {
            charges = -0.01;
          }

          invoice.postings.push({
            type: PostingType.charges,
            description: 'Encargos',
            amount: charges,
          });
        }

        const totalAmount = invoice.postings.reduce((sum, posting) => sum + posting.amount, 0);
        const customer = await CustomerRepository.get(invoice._customerId);

        invoice.amount = Math.round(totalAmount * 100) / 100;
        invoice.dueDate = new Date(year, month + 1, customer.invoiceMaturity);
        invoice.closed = true;

        try {
          const updatedInvoice = await invoice.save();
          response.closed.push(updatedInvoice);

        } catch (err) {
          console.error('INVOICE_CLOSE_ERROR', err, invoice);
          response.closeError.push(invoice);
        }

        await EmailService.invoiceClosed(customer, invoice);

        try {
          const newInvoice = await this.generateNextInvoice(
            year,
            month + 1,
            invoice._customerId,
            invoice.amount
          );
          response.opened.push(newInvoice);

        } catch (err) {
          console.error('INVOICE_OPEN_ERROR', err);
          response.openError.push(err);
        }
      }

      new ResponseOk(res, response);

    } catch (err) {
      console.error('INVOICE_CLOSE_ALL_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }
}

export default new InvoiceController;
