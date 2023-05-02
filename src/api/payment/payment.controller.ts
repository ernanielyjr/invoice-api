import { Request, Response } from "express";
import { Helper } from "../../helper";
import {
  PagSeguroNotificationType,
  PagSeguroTransactionStatus,
} from "../../models/pagseguro-notification.model";
import PostingType from "../../models/posting-type.enum";
import {
  ErrorMessages,
  httpStatus,
  ResponseError,
  ResponseOk,
} from "../../models/response.model";
import { PaymentService } from "../../services/payment.service";
import CustomerRepository from "../customer/customer.repository";
import EmailService from "../email/email.service";
import InvoiceRepository from "../invoice/invoice.repository";

class PaymentController {
  async notify(req: Request, res: Response) {
    try {
      /* TODO: improve this domain origin check
      const origin = req.get('origin');

      if (AppConfig.pagSeguro.allowedOriginUrl !== origin) {
        EmailService.adminLog('BAD_ORIGIN_DOMAIN', origin, req.body);
        return new ResponseError(res, ErrorMessages.PAYMENT_DETAIL_INVALID_DATA);
      } */

      const paidStatus = [
        PagSeguroTransactionStatus.PAGA,
        PagSeguroTransactionStatus.DISPONIVEL,
      ];

      const { notificationCode, notificationType } = req.body;
      const { id } = req.params;

      if (notificationType !== PagSeguroNotificationType.TRANSACTION) {
        EmailService.adminLog(
          "IS_NOT_TRANSACTION_NOTIFICATION",
          { params: req.params },
          { body: req.body }
        );
        return new ResponseOk(res, "IS_NOT_TRANSACTION_NOTIFICATION");
      }

      const result = await PaymentService.getDetail(notificationCode);

      if (!result || result.reference !== id) {
        EmailService.adminLog(
          "INVALID_DATA",
          { params: req.params },
          { body: req.body },
          { result }
        );
        return new ResponseError(
          res,
          ErrorMessages.PAYMENT_DETAIL_INVALID_DATA
        );
      }

      const invoice = await InvoiceRepository.get({ id });

      if (!invoice) {
        EmailService.adminLog(
          "INVOICE_NOT_FOUND",
          { params: req.params },
          { body: req.body },
          { result }
        );
        return new ResponseError(
          res,
          ErrorMessages.PAYMENT_DETAIL_INVALID_DATA
        );
      }

      invoice.lastStatus = result.status;
      invoice.lastStatusTime = new Date();

      const paid = paidStatus.includes(result.status);
      const alreadyPaid = invoice.paid;

      if (!alreadyPaid) {
        invoice.paid = paid;
        invoice.deferredPayment = !paid;
      }
      await invoice.save();

      const customer = await CustomerRepository.get({
        id: invoice._customerId,
      });

      if (!paid) {
        EmailService.adminLog(
          "NOT_PAID_STATUS",
          { params: req.params },
          { body: req.body },
          { result },
          { invoice },
          { customer }
        );
      }

      if (!alreadyPaid && paid) {
        const amount = Number.parseFloat(result.amount);

        const openedInvoice = await InvoiceRepository.getOpenedByCustomer(
          invoice._customerId
        );
        const postingPayment = openedInvoice.postings.find(
          (posting) => posting.notificationCode === notificationCode
        );

        if (!postingPayment) {
          openedInvoice.postings.push({
            notificationCode,
            type: PostingType.income,
            description: "Pagamento Recebido",
            amount: -Math.abs(amount),
          });
          await openedInvoice.save();

          EmailService.invoicePaymentReceived(customer, amount);
        }
      }

      return new ResponseOk(res, null, httpStatus.NO_CONTENT);
    } catch (err) {
      console.error("INVOICE_PAY_NOTIFY", err);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async pay(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceRepository.get({ id });

      if (!invoice) {
        return new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

      if (!invoice.read) {
        invoice.read = true;
        await invoice.save();
      }

      new ResponseOk(res, invoice);
    } catch (err) {
      console.error("INVOICE_PAY_CODE", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async billet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { senderHash } = req.body;
      const invoice = await InvoiceRepository.get({ id });

      if (!invoice) {
        return new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

      if (!invoice.closed) {
        return new ResponseError(res, ErrorMessages.INVOICE_NOT_CLOSED);
      }

      if (invoice.paid) {
        return new ResponseError(res, ErrorMessages.INVOICE_ALREADY_PAID);
      }

      const payment = new PaymentService();
      let url = await payment.getBillet(invoice, senderHash);

      if (url) {
        url = url.replace("print.jhtml", "print_image.jhtml");
      }

      invoice.paymentData = url;
      invoice.paymentMode = "billet";
      await invoice.save();

      new ResponseOk(res, url);
    } catch (err) {
      console.error("INVOICE_BILLET", err, req.body);

      if (err && err.type === "VALIDATION") {
        return new ResponseError(res, ErrorMessages.INVOICE_BILLET_VALIDATION);
      }

      return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async sessionId(req: Request, res: Response) {
    try {
      const sessionId = await PaymentService.getSessionId();
      new ResponseOk(res, sessionId);
    } catch (err) {
      console.error("INVOICE_PAY_CODE", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async code(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceRepository.get({ id });

      if (!invoice) {
        return new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }

      if (!invoice.closed) {
        return new ResponseError(res, ErrorMessages.INVOICE_NOT_CLOSED);
      }

      if (invoice.paid) {
        return new ResponseError(res, ErrorMessages.INVOICE_ALREADY_PAID);
      }

      const monthYear = Helper.getMonthYear(invoice.month - 1, invoice.year);

      const payment = new PaymentService();
      payment.setReference(invoice._id);
      payment.setCustomer(invoice.customer.emails[0], invoice.customer.name);
      payment.addItem(
        `Fatura de ${monthYear} de ${invoice.year}`,
        invoice.amount
      );

      const code = await payment.getCode();

      invoice.paymentData = code;
      invoice.paymentMode = "normal"; // TODO: fazer enum
      await invoice.save();

      new ResponseOk(res, code);
    } catch (err) {
      console.error("INVOICE_PAY_CODE", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }
}

export default new PaymentController();
