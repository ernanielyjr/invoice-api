import { Request, Response } from 'express';
import AppConfig from '../../configs/app.config';
import Locale from '../../models/locale.model';
import { PagSeguroNotificationType, PagSeguroTransactionStatus } from '../../models/pagseguro-notification.model';
import PostingType from '../../models/posting-type.enum';
import { ErrorMessages, httpStatus, ResponseError, ResponseOk } from '../../models/response.model';
import { PaymentService } from '../../services/payment.service';
import CustomerRepository from '../customer/customer.repository';
import EmailService from '../email/email.service';
import InvoiceRepository from '../invoice/invoice.repository';

class PaymentController {

  async notify(req: Request, res: Response) {
    try {
      /* TODO: improve this domain origin check
      const origin = req.get('origin');

      if (AppConfig.pagSeguro.allowedOriginUrl !== origin) {
        EmailService.adminLog('BAD_ORIGIN_DOMAIN', origin, req.body);
        return new ResponseError(res, ErrorMessages.PAYMENT_DETAIL_INVALID_DATA);
      } */

      const { notificationCode, notificationType } = req.body;
      const { id } = req.params;

      if (notificationType !== PagSeguroNotificationType.TRANSACTION) {
        EmailService.adminLog('IS_NOT_TRANSACTION_NOTIFICATION', { invoiceId: id }, { body: req.body });
        return new ResponseOk(res, 'IS_NOT_TRANSACTION_NOTIFICATION');
      }

      const result = await PaymentService.getDetail(notificationCode);

      if (!result || result.reference !== id) {
        EmailService.adminLog('INVALID_DATA', result, { invoiceId: id }, { body: req.body });
        return new ResponseError(res, ErrorMessages.PAYMENT_DETAIL_INVALID_DATA);
      }

      if (result.status !== PagSeguroTransactionStatus.PAGA) {
        EmailService.adminLog('NOT_PAID_STATUS', result, { invoiceId: id }, { body: req.body });
        return new ResponseOk(res, 'NOT_PAID_STATUS');
      }

      const invoice = await InvoiceRepository.get(id);

      invoice.paid = true;
      await invoice.save();

      const amount = Number.parseFloat(result.amount);

      const openedInvoice = await InvoiceRepository.getOpenedByCustomer(invoice._customerId);
      const postingPayment = openedInvoice.postings.find(posting => posting.notificationCode === notificationCode);

      if (!postingPayment) {
        openedInvoice.postings.push({
          notificationCode,
          type: PostingType.income,
          description: 'Pagamento Recebido',
          amount: -Math.abs(amount),
        });
        await openedInvoice.save();

        const customer = await CustomerRepository.get(invoice._customerId);
        EmailService.invoicePaymentReceived(customer, amount);
      }

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

      if (force === 'true' || (!invoice.paymentCode && invoice.closed)) {
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
