import { Request, Response } from 'express';
import Locale from '../../models/locale.model';
import { ErrorMessages, ResponseError, ResponseOk } from '../../models/response.model';
import { PaymentService } from '../../services/payment.service';
import CustomerRepository from '../customer/customer.repository';
import InvoiceRepository from '../invoice/invoice.repository';

class PaymentController {

  async notify(req: Request, res: Response) {
    const { notificationCode, notificationType } = req.body;

    if (notificationType !== 'transaction') {
      console.error('IS_NOT_TRANSACTION_NOTIFICATION', req.body);
      return new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
    }

    const result = await PaymentService.getDetail(notificationCode);

    return new ResponseOk(res, result);
  }

  async pay(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { force } = req.query;
      const invoice = await InvoiceRepository.get(id);

      if (!invoice) {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
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
