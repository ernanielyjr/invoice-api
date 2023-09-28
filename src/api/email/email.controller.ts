import { Request, Response } from "express";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import AppConfig from "../../configs/app.config";
import CrudController from "../../models/crud.controller";
import {
  ErrorMessages,
  httpStatus,
  ResponseError,
  ResponseOk,
} from "../../models/response.model";
import EmailRepository from "./email.repository";

class EmailController extends CrudController {
  private transporter: Mail; // TODO: mudar pra service
  private defaultMessage: Mail.Options = {
    from: {
      name: AppConfig.smtp.name,
      address: AppConfig.smtp.user,
    },
    replyTo: {
      name: AppConfig.smtp.name,
      address: AppConfig.smtp.email,
    },
  };

  constructor() {
    super(EmailRepository);

    this.transporter = nodemailer.createTransport({
      service: AppConfig.smtp.service,
      auth: {
        user: AppConfig.smtp.user,
        pass: AppConfig.smtp.pass,
      },
      from: {
        name: AppConfig.smtp.name,
        address: AppConfig.smtp.user,
      },
    });
  }

  async sendAll(req: Request, res: Response) {
    try {
      const emails = await EmailRepository.listUnsent().exec();
      const sentEmails: any[] = [];
      const errorEmails: any[] = [];

      for (const email of emails) {
        const message: Mail.Options = {
          ...this.defaultMessage,
          to: email.cc,
          subject: email.subject,
          html: email.body,
        };

        try {
          const info = await this.transporter.sendMail(message);

          email.sent = true;
          email.response = info;
          const savedEmail = await email.save();

          sentEmails.push(savedEmail);
        } catch (error) {
          errorEmails.push(error);
          console.error("EMAIL_SEND_ERROR", error);
        }
      }

      if (sentEmails.length) {
        return new ResponseOk(res, sentEmails);
      }

      if (errorEmails.length) {
        return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      }

      return new ResponseOk(res, null);
    } catch (err) {
      console.error("CRUD_GET_ERROR", err, req.body);
      return new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  listUnsent(req: Request, res: Response) {
    EmailRepository.listUnsent()
      .then((items) => {
        new ResponseOk(res, items || []);
      })
      .catch((err) => {
        console.error("CRUD_GET_ERROR", err, req.body);
        new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      });
  }
}

export default new EmailController();
