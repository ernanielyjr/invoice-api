import PostingType from '../../models/posting-type.enum.1';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from '../../models/response.model';
import CustomerRepository from '../customer/customer.repository';
import ServiceRepository from '../service/service.repository';
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

  async closeAllInvoices(req, res) {
    try {
      // UNDO: const today = new Date();
      const today = new Date(2018, 9 - 1, 30);
      const year = today.getFullYear();
      const month = today.getMonth();

      const closeDate = new Date(year, month + 1, 0);

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

      await invoicesList.forEach(async (invoice) => {
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

        invoice.amount = Math.round(totalAmount * 100) / 100;
        invoice.closed = true;

        try {
          const updatedInvoice = await invoice.save();
          response.closed.push(updatedInvoice);

        } catch (err) {
          console.error('INVOICE_CLOSE_ERROR', err, invoice);
          response.closeError.push(invoice);
        }

        // TODO: registrar email a ser enviado

        const nextInvoiceDate = new Date(year, month + 1, 1);
        const nextInvoice = {
          _customerId: invoice._customerId,
          closed: false,
          month: nextInvoiceDate.getMonth() + 1,
          year: nextInvoiceDate.getFullYear(),
          postings: []
        };

        nextInvoice.postings.push({
          type: PostingType.balance,
          description: 'Saldo da Fatura Anterior',
          amount: invoice.amount,
        });

        const customerServices = await ServiceRepository.find({
          _customerId: invoice._customerId,
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
          response.opened.push(newInvoice);

        } catch (err) {
          console.error('INVOICE_OPEN_ERROR', err, nextInvoice);
          response.openError.push(nextInvoice);
        }
      });

      new ResponseOk(res, response);

    } catch (err) {
      console.error('INVOICE_CLOSE_ALL_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
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
