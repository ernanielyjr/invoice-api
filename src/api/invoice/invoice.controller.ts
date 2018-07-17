import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import InvoiceRepository from './invoice.repository';
import CustomerRepository from '../customer/customer.repository';

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
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const tenDays = 10 * 24 * 60 * 60 * 1000;
      const maturityDate = new Date(today.getTime() + tenDays);
      const maturityDay = maturityDate.getDate();

      const customersList = await CustomerRepository.find({
        invoitceMaturiry: maturityDay
      });

      if (!customersList || !customersList.length) {
        console.log('NO_INVOICES_TO_CLOSE');
        return new ResponseOk(res, null);
      }

      customersList.forEach(async (customer) => { // somente clientes cuja fatura fecha hoje
        const invoicesList = await InvoiceRepository.find({
          month: {
            $lt: month
          },
          year: {
            $lte: year
          },
        });
        // listar faturas do cliente diferente da competência atual
          // verificar se o cliente nao posssui nenhuma fatura fechada no dia de hoje
            // ???? somar todos os lançamentos da fatura da competência anterior (creditos e debitos)

            // cria uma nova fatura para a competencia corrente e deixa aberta
            // a nova competencia é sempre o mes/ano do dia de fechamento
            // colocar a data atual na data de fechamento

          // senao --abortar--
      });

      const customersId = customersList.map(customer => customer._id);
      console.log(customersId);

      new ResponseOk(res, null, httpStatus.NO_CONTENT);

    } catch (err) {
      console.error('INVOICE_CLOSE_ERROR', err, req.body);
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
