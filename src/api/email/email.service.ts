import ejs from "ejs";
import fs from "fs";
import path from "path";
import AppConfig from "../../configs/app.config";
import { Helper } from "../../helper";
import EmailRepository from "./email.repository";

class EmailService {
  templateService = new TemplateService();

  adminLog(label: string, ...data: any[]) {
    console.error(label, data);
    const subject = `LOG MyPlan - ${label}`;
    const allData = data.map((value) => this.templateService.log(value));
    const body: string = this.templateService.default(allData.join("<hr />"));

    return this.register(AppConfig.adminEmail, subject, body);
  }

  invoiceClosed(customer, closedInvoice) {
    const name = customer.responsibleName || customer.name || "Cliente";
    const firstName = name.split(" ")[0];
    const monthYear = Helper.getMonthYear(
      closedInvoice.month - 1,
      closedInvoice.year
    );
    const dueDate = Helper.dateToString(closedInvoice.dueDate);
    const subject = `Sua fatura de ${monthYear} está fechada`;

    const body = this.templateService.invoiceClosed(
      subject,
      firstName,
      monthYear,
      dueDate,
      closedInvoice.amount.toFixed(2),
      `${AppConfig.emailBaseUrl}/${closedInvoice._id}`,
      closedInvoice.paid
    );

    return this.register(customer.emails, subject, body);
  }

  invoiceAwaitingPayment(customer, closedInvoice) {
    const name = customer.responsibleName || customer.name || "Cliente";
    const firstName = name.split(" ")[0];
    const monthYear = Helper.getMonthYear(
      closedInvoice.month - 1,
      closedInvoice.year
    );
    const dueDate = Helper.dateToString(closedInvoice.dueDate);
    const subject = `Pagamento pendente da fatura de ${monthYear}`;

    const body = this.templateService.invoiceAwaitingPayment(
      subject,
      firstName,
      monthYear,
      dueDate,
      closedInvoice.amount.toFixed(2),
      `${AppConfig.emailBaseUrl}/${closedInvoice._id}`
    );

    return this.register(customer.emails, subject, body);
  }

  invoicePaymentReceived(customer, amount: number) {
    const name = customer.responsibleName || customer.name || "Cliente";
    const firstName = name.split(" ")[0];
    const subject = "Pagamento recebido!";

    const body = this.templateService.invoicePaymentReceived(
      subject,
      firstName,
      amount.toFixed(2)
    );

    return this.register(customer.emails, subject, body);
  }

  private register(cc: string | string[], subject: string, body: string) {
    let newCc = cc;
    if (typeof cc === "string") {
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
      fileContent = fs.readFileSync(filePath, "utf-8");
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

    if (typeof content === "string") {
      newContent = content;
    } else {
      newContent = JSON.stringify(content, null, 4);
    }

    return `<pre>${newContent}</pre><hr />`;
  }

  invoiceClosed(
    subject: string,
    firstName: string,
    monthYear: string,
    dueDate: string,
    totalAmount: string,
    paymentLink: string,
    paid: boolean
  ) {
    return this.renderTemplateFile(
      path.resolve(__dirname, "../../templates/invoice-closed.ejs"),
      {
        subject,
        firstName,
        monthYear,
        dueDate,
        totalAmount,
        paid,
        paymentLink,
      }
    );
  }

  invoiceAwaitingPayment(
    subject: string,
    firstName: string,
    monthYear: string,
    dueDate: string,
    totalAmount: string,
    paymentLink: string
  ) {
    return this.renderTemplateFile(
      path.resolve(__dirname, "../../templates/invoice-awaiting-payment.ejs"),
      {
        subject,
        firstName,
        monthYear,
        dueDate,
        totalAmount,
        paymentLink,
      }
    );
  }

  invoicePaymentReceived(
    subject: string,
    firstName: string,
    totalAmount: string
  ) {
    return this.renderTemplateFile(
      path.resolve(__dirname, "../../templates/invoice-payment-received.ejs"),
      {
        subject,
        firstName,
        totalAmount,
      }
    );
  }
}

export default new EmailService();
