import * as https from "https";
import * as PagSeguro from "pagseguro";
import * as querystring from "querystring";
import * as xml2js from "xml2js";
import AppConfig from "../configs/app.config";
import { Helper } from "../helper";
import {
  PagSeguroNotification,
  PagSeguroSession,
  PagSeguroTransactionStatus,
} from "../models/pagseguro-notification.model";

export class PaymentService {
  private paymentProvider: PagSeguro;

  constructor() {
    this.paymentProvider = new PagSeguro({
      email: AppConfig.pagSeguro.email,
      token: AppConfig.pagSeguro.token,
      mode: AppConfig.pagSeguro.mode,
    });

    this.paymentProvider.currency("BRL");
  }

  setReference(reference: string): void {
    const code = reference.toString();
    this.paymentProvider
      .reference(code)
      .setRedirectURL(`${AppConfig.emailBaseUrl}/${code}`)
      .setNotificationURL(`${AppConfig.apiBaseUrl}/v1/payment/${code}/notify`);
  }

  setCustomer(email: string, name?: string): void {
    this.paymentProvider.buyer({
      email,
      name,
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

  static async getSessionId(): Promise<string> {
    const { mode, email, token } = AppConfig.pagSeguro;

    return new Promise<string>((resolve, reject) => {
      const addUrl = mode === "sandbox" ? "sandbox." : "";
      const options = {
        hostname: `ws.${addUrl}pagseguro.uol.com.br`,
        port: 443,
        path: `/v2/sessions/?email=${email}&token=${token}`,
        method: "POST",
      };

      const req = https.request(options, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          const parser = new xml2js.Parser({ explicitArray: false });
          parser.parseString(
            data,
            (parseStringError, result: PagSeguroSession) => {
              if (parseStringError) {
                return reject(parseStringError);
              }

              const { session } = result;
              return resolve(session.id);
            }
          );
        });
      });

      req.on("error", (err) => reject(err));
      req.end();
    });
  }

  async getBillet(invoice: any, senderHash: string): Promise<any> {
    const { mode, email, token } = AppConfig.pagSeguro;
    const { customer } = invoice;

    let [phone] = customer.phones;
    phone = phone.replace("+55", "").replace(/\D/g, "");
    let phoneAreaCode = phone.substr(0, 2);
    let phoneNumber = phone.substr(2);
    if (phoneNumber.length < 8) {
      phoneAreaCode = "51";
      phoneNumber = phone;
    }

    const { address } = customer;
    let customerEmail = customer.emails[0];
    if (mode === "sandbox") {
      customerEmail = customerEmail.replace(
        /\@.*/g,
        "@sandbox.pagseguro.com.br"
      );
    }

    return new Promise((resolve, reject) => {
      const monthYear = Helper.getMonthYear(invoice.month - 1, invoice.year);

      const data = {
        senderHash,
        paymentMode: "default",
        paymentMethod: "boleto",
        currency: "BRL",
        receiverEmail: email,

        notificationURL: `${
          AppConfig.apiBaseUrl
        }/v1/payment/${invoice._id.toString()}/notify`,
        reference: invoice._id.toString(),
        senderName: Helper.normalizeString(customer.name),
        senderAreaCode: phoneAreaCode,
        senderPhone: phoneNumber,
        senderEmail: customerEmail,

        shippingAddressStreet: Helper.normalizeString(address.street),
        shippingAddressNumber: address.number,
        shippingAddressComplement: Helper.normalizeString(address.complement),
        shippingAddressDistrict: Helper.normalizeString(address.neighborhood),
        shippingAddressPostalCode: address.zipCode,
        shippingAddressCity: Helper.normalizeString(address.city),
        shippingAddressState: Helper.normalizeString(address.state),
        shippingAddressCountry: Helper.normalizeString(address.country),

        itemId1: 1,
        itemDescription1: Helper.normalizeString(
          `Fatura de ${monthYear} de ${invoice.year}`
        ),
        itemAmount1: Math.abs(invoice.amount).toFixed(2),
        itemQuantity1: 1,
      };

      const document = customer.documentNumber.replace(/\D/g, "");
      if (customer.documentType === "CPF") {
        data["senderCPF"] = document;
      } else if (customer.documentType === "CNPJ") {
        data["senderCNPJ"] = document;
      }

      const postData = querystring.stringify(data);
      const addUrl = mode === "sandbox" ? "sandbox." : "";

      const options = {
        hostname: `ws.${addUrl}pagseguro.uol.com.br`,
        port: 443,
        path: `/v2/transactions/?email=${email}&token=${token}`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": postData.length,
        },
      };

      const req = https.request(options, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          const parser = new xml2js.Parser({ explicitArray: false });
          parser.parseString(
            data,
            (parseStringError, result: PagSeguroNotification) => {
              if (parseStringError) {
                return reject(parseStringError);
              }

              if (result && result.errors && result.errors.error) {
                return reject({
                  type: "VALIDATION",
                  errors: result.errors.error,
                });
              }

              const { transaction } = result;

              return resolve(transaction.paymentLink);
            }
          );
        });
      });

      req.on("error", (err) => reject(err));
      req.write(postData);
      req.end();
    });
  }

  getCode(): Promise<string> {
    const { obj } = this.paymentProvider;

    if (
      !obj ||
      !obj.reference ||
      !obj.sender ||
      !obj.sender.email ||
      !obj.items ||
      !obj.items.length
    ) {
      return Promise.reject({
        err: "MISSING_CONFIGURATION",
      });
    }

    return new Promise((resolve, reject) => {
      this.paymentProvider.send((pagSeguroError, pagSeguroResponse) => {
        if (pagSeguroError) {
          return reject(pagSeguroError);
        }

        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(
          pagSeguroResponse,
          (parseStringError, result: PagSeguro.ResponseBody) => {
            if (parseStringError) {
              return reject(parseStringError);
            }

            if (result && result.checkout && result.checkout.code) {
              return resolve(result.checkout.code);
            }

            return reject({
              err: "MISSING_CODE_ON_RESPONSE",
            });
          }
        );
      });
    });
  }

  static getDetail(code: string): Promise<DetailResponse> {
    return new Promise((resolve, reject) => {
      const { notificationUrl, email, token } = AppConfig.pagSeguro;

      https
        .get(
          `${notificationUrl}/${code}?email=${email}&token=${token}`,
          (response) => {
            let data = "";
            response.on("data", (chunk) => {
              data += chunk;
            });

            response.on("end", () => {
              const parser = new xml2js.Parser({ explicitArray: false });
              parser.parseString(
                data,
                (parseStringError, result: PagSeguroNotification) => {
                  if (parseStringError) {
                    return reject(parseStringError);
                  }

                  const { transaction } = result;

                  if (!transaction) {
                    return reject("TRANSACTION_NOT_FOUND");
                  }

                  return resolve({
                    code: transaction.code,
                    reference: transaction.reference,
                    status: transaction.status,
                    amount: transaction.grossAmount,
                  });
                }
              );
            });
          }
        )
        .on("error", (err) => {
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
