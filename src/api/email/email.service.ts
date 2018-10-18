import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import AppConfig from '../../configs/app.config';
import { Helper } from '../../helper';
import EmailRepository from './email.repository';

class EmailService {

  templateService = new TemplateService();

  constructor() { }

  adminLog(label: string, ...data: any[]) {
    console.error(label, data);
    const subject = `LOG MyPlan - ${label}`;
    const allData = data.map(value => this.templateService.log(value));
    const body: string = this.templateService.default(allData.join('<hr />'));

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
      `${AppConfig.emailBaseUrl}/${closedInvoice._id}`
    );

    return this.register(customer.emails.join(','), subject, body);
  }

  invoicePaymentReceived(customer, amount: number) {
    const firstName = customer.responsibleName.split(' ')[0];
    const subject = 'Pagamento recebido!';

    const body = this.templateService.invoicePaymentReceived(
      subject,
      firstName,
      amount.toFixed(2)
    );

    return this.register(customer.emails.join(','), subject, body);
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

    return `<pre>${newContent}</pre><hr />`;
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

  invoicePaymentReceived(subject: string, firstName: string, totalAmount: string) {
    return this.renderTemplateFile(path.resolve(__dirname, '../../templates/invoice-payment-received.ejs'), {
      subject,
      firstName,
      totalAmount,
    });
  }
}

export default new EmailService;