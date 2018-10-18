import * as https from 'https';
import * as PagSeguro from 'pagseguro';
import * as xml2js from 'xml2js';
import AppConfig from '../configs/app.config';
import { PagSeguroNotification, PagSeguroTransactionStatus } from '../models/pagseguro-notification.model';

export class PaymentService {
  private paymentProvider: PagSeguro;

  constructor() {
    this.paymentProvider = new PagSeguro({
      email: AppConfig.pagSeguro.email,
      token: AppConfig.pagSeguro.token,
      mode: AppConfig.pagSeguro.mode,
    });

    this.paymentProvider.currency('BRL');
  }

  setReference(reference: string): void {
    const code = reference.toString();
    this.paymentProvider.reference(code)
    .setRedirectURL(`${AppConfig.apiBaseUrl}/v1/payment/${code}`)
    .setNotificationURL(`${AppConfig.apiBaseUrl}/v1/payment/${code}/notify`);
  }

  setCustomer(email: string, name?: string): void {
    this.paymentProvider.buyer({
      email,
      name
    });
  }

  addItem(description: string, amount: number): void {
    const { obj } = this.paymentProvider;
    const items = obj.items || [];

    this.paymentProvider.addItem({
      description,
      amount: Math.abs(amount).toFixed(2),
      id: items.length + 1,
      quantity: 1,
    });
  }

  getCode(): Promise<string> {
    const { obj } = this.paymentProvider;

    if (!obj || !obj.reference || !obj.sender || !obj.sender.email || !obj.items || !obj.items.length) {
      return Promise.reject({
        err: 'MISSING_CONFIGURATION'
      });
    }

    return new Promise((resolve, reject) => {
      this.paymentProvider.send((pagSeguroError, pagSeguroResponse) => {
        if (pagSeguroError) {
          return reject(pagSeguroError);
        }

        const parser = new xml2js.Parser({ explicitArray : false });
        parser.parseString(pagSeguroResponse, (parseStringError, result: PagSeguro.ResponseBody) => {
          if (parseStringError) {
            return reject(parseStringError);
          }

          if (result && result.checkout && result.checkout.code) {
            return resolve(result.checkout.code);
          }

          return reject({
            err: 'MISSING_CODE_ON_RESPONSE'
          });

        });
      });
    });
  }

  static getDetail(code: string): Promise<DetailResponse> {
    return new Promise((resolve, reject) => {
      const { notificationUrl, email, token } = AppConfig.pagSeguro;

      https.get(`${notificationUrl}/${code}?email=${email}&token=${token}`, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          const parser = new xml2js.Parser({ explicitArray : false });
          parser.parseString(data, (parseStringError, result: PagSeguroNotification) => {
            if (parseStringError) {
              return reject(parseStringError);
            }

            const { transaction } = result;

            return resolve({
              code: transaction.code,
              reference: transaction.reference,
              status: transaction.status,
              amount: transaction.grossAmount,
            });
          });
        });

      }).on('error', (err) => {
        reject(err);
      });
    });
  }
}

interface DetailResponse {
  // TODO: mapear objeto completo - https://devs.pagseguro.uol.com.br/docs/checkout-web-notificacoes#recebendo-uma-notificacao-de-transacao
  code: string;
  reference: string;
  status: PagSeguroTransactionStatus;
  amount: string;
}
