import EmailRepository from './email.repository';
import AppConfig from '../../configs/app.config';
import Locale from '../../models/locale.model';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

class EmailService {

  templateService = new TemplateService();

  constructor() { }

  adminLog(label: string, data: any) {
    const subject = `LOG MyPlan - ${label}`;
    const body = this.templateService.log(JSON.stringify(data));

    return this.register(AppConfig.adminEmail, subject, body);
  }

  invoiceClosed(customer, closedInvoice) {
    const firstName = customer.responsibleName.split(' ')[0];
    const monthYear = Helper.getMonthYear(closedInvoice.month - 1, closedInvoice.year);
    const dueDate = Helper.getFormattedDate(customer.invoiceMaturity, closedInvoice.month + 1, closedInvoice.year);
    const subject = `Sua fatura de ${monthYear} está fechada`;

    const body = this.templateService.invoiceClosed(
      subject,
      firstName,
      monthYear,
      dueDate,
      closedInvoice.amount.toFixed(2),
      `${AppConfig.emailBaseUrl}/api/v1/payment/${closedInvoice._id}`
    );

    return this.register(customer.emails.join(','), subject, body);
  }

  invoicePaymentReceived(customer, invoice, amount: number) {
    // FIXME: TERMINAR
    /* if (Math.abs(invoice.amount) !== Math.abs(amount)) {
      let content = JSON.stringify(invoice);
      content += '\n\n';
      content += `receivedAmount = ${amount}`;
      const alertBody = this.templateService.log(content);
      this.register(AppConfig.adminEmail, 'Divergência nos valores', alertBody);
    } */
  }

  private register(cc: string | string[], subject: string, body: string) {
    let newCc = cc;
    if (typeof cc === 'string') {
      newCc = [cc];
    }

    const email: any = {
      subject,
      body,
      cc: newCc,
      sent: false,
    };

    if (newCc.indexOf(AppConfig.adminEmail) === -1) {
      email.cco = AppConfig.adminEmail;
    }

    return EmailRepository.create(email);
  }
}

class Helper {
  static getFormattedDate(day: number, month: number, year: number): string {
    const dayStr = String(`00${day}`).slice(-2);
    const monthStr = String(`00${month}`).slice(-2);
    const yearStr = String(`0000${year}`).slice(-4);
    return `${dayStr}/${monthStr}/${yearStr}`;
  }

  static getMonthYear(month: number, year: number) {
    return `${Locale.monthNames[month]}/${year}`;
  }
}

class TemplateService {
  private cachedFiles: {
    [key: string]: string;
  }[] = [];

  private getTemplateFile(filePath: string) {
    let fileContent = this.cachedFiles[filePath];

    if (!fileContent) {
      fileContent = fs.readFileSync(filePath, 'utf-8');
      this.cachedFiles[filePath] = fileContent;
    }

    return fileContent;
  }

  private renderTemplateFile(filePath: string, data: any): string {
    const fileContent = this.getTemplateFile(filePath);
    return ejs.render(fileContent, data);
  }

  default(content: string) {
    return `<html><body>${content}</body></html>`;
  }

  log(content: string | object | any[]) {
    if (!content) {
      return;
    }

    let newContent: string;

    if (typeof content === 'string') {
      newContent = content;
    } else {
      newContent = JSON.stringify(content);
    }

    return `<pre>${newContent}</pre>`;
  }

  invoiceClosed(subject: string, firstName: string, monthYear: string, dueDate: string, totalAmount: string, paymentLink: string) {
    return this.renderTemplateFile(path.resolve(__dirname, '../../templates/invoice-closed.ejs'), {
      subject,
      firstName,
      monthYear,
      dueDate,
      totalAmount,
      paymentLink,
    });
  }

  /* invoicePaymentReceived(totalAmount: string) {
    // FIXME: FAZER TEMPLATE PARA PAGAMENTO RECEBIDO
    return this.renderTemplateFile(path.resolve(__dirname, '../../templates/invoice-payment-received.ejs'), {
      firstName,
      monthYear,
      dueDate,
      totalAmount,
      paymentLink,
    });
  } */
}

export default new EmailService;
