import { Request, Response } from 'express';
import Locale from '../../models/locale.model';
import PostingType from '../../models/posting-type.enum';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from '../../models/response.model';
import { PaymentService } from '../../services/payment.service';
import CustomerRepository from '../customer/customer.repository';
import EmailService from '../email/email.service';
import InvoiceRepository from '../invoice/invoice.repository';

class PaymentController {

  async notify(req: Request, res: Response) {
    try {
      // FIXME: Rejeitar quando a origem não é o pagseguro
      const { notificationCode, notificationType } = req.body;
      const { id } = req.params;

      if (notificationType !== 'transaction') {
        console.error('IS_NOT_TRANSACTION_NOTIFICATION', req.body);
        EmailService.adminLog('IS_NOT_TRANSACTION_NOTIFICATION', req.body);
        return new ResponseOk(res, 'IS_NOT_TRANSACTION_NOTIFICATION');
      }

      const result = await PaymentService.getDetail(notificationCode);
      if (result.code !== notificationCode || result.reference !== id) {
        console.error('INVALID_DATA', result, req.body);
        EmailService.adminLog('INVALID_DATA', result);
        return new ResponseError(res, ErrorMessages.PAYMENT_DETAIL_INVALID_DATA);
      }

      if (result.status !== 3) {
        EmailService.adminLog('NOT_PAID_STATUS', result);
        return new ResponseOk(res, 'NOT_PAID_STATUS');
      }

      const invoice = await InvoiceRepository.get(id);

      invoice.paid = true;
      await invoice.save();

      const openedInvoice = await InvoiceRepository.getOpenedByCustomer(invoice._customerId);
      openedInvoice.postings.push({
        type: PostingType.income,
        description: 'Pagamento Recebido',
        amount: Math.abs(result.amount),
      });
      await openedInvoice.save();

      const customer = await CustomerRepository.get(invoice._customerId);
      EmailService.invoicePaymentReceived(customer, invoice, result.amount);

      return new ResponseOk(res, null, httpStatus.NO_CONTENT);
    } catch (err) {
      console.error('INVOICE_PAY_NOTIFY', err);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async pay(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { force } = req.query;
      const invoice = await InvoiceRepository.get(id);

      if (!invoice) {
        return new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

      if (!invoice.closed) {
        return new ResponseError(res, ErrorMessages.INVOICE_NOT_CLOSED);
      }

      if (invoice.paid) {
        return new ResponseError(res, ErrorMessages.INVOICE_ALREADY_PAID);
      }

      if (force === 'true' || !invoice.paymentCode) {
        const customer = await CustomerRepository.get(invoice._customerId);

        const payment = new PaymentService();
        payment.setReference(invoice._id);
        payment.setCustomer(customer.emails[0], customer.name);

        const monthName = Locale.monthNames[invoice.month];

        payment.addItem(`Fatura de ${monthName} de ${invoice.year}`, invoice.amount);

        invoice.paymentCode = await payment.getCode();
        await invoice.save();
      }

      new ResponseOk(res, invoice);

    } catch (err) {
      console.error('INVOICE_PAY_CODE', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

}

export default new PaymentController;
