declare module 'pagseguro' {

  namespace PagSeguro {
    interface Config {
      email: string;
      token: string;
      mode?: 'payment' | 'sandbox' | 'subscription';
    }

    interface Item {
      id: number;
      description: string;
      amount: string;
      quantity: number;
      weight?: number;
    }

    interface Buyer {
      name?: string;
      email?: string;
      phoneAreaCode?: string;
      phoneNumber?: string;
    }

    interface ShippingInfo {
      type?: number,
      street?: string;
      number?: string;
      complement?: string;
      district?: string;
      postalCode?: string;
      city?: string;
      state?: string;
      country?: string;
    }

    interface PreApprovalInfo {
      maxTotalAmount?: string;
      charge?: string;
      finalDate?: string;
      name?: string;
      details?: string;
      period?: string;
      amountPerPayment?: string;
      maxAmountPerPayment?: string;
      maxPaymentsPerPeriod?: string;
      maxAmountPerPeriod?: string;
      initialDate?: string;
    }

    interface ResponseBody {
      checkout: {
        code: string,
        date: string
      }
    }

    interface ResponseError {
      errors: {
        error: [{
          code: string[],
          message: string[]
        }]
      }
    }

  }

  class PagSeguro {
    public email: string;
    public token: string;
    public mode: 'payment' | 'sandbox' | 'subscription';
    public obj: {
      currency: 'BRL' | 'USD';
      reference: string,
      redirectURL?: string,
      notificationURL?: string,
      sender?: {
        hash?: string,
        cpf?: string,
        cnpj?: string,
        name?: string,
        email: string,
        phone?: {
          areaCode: string,
          number: string,
        },
        address?: {
          street: string,
          number: string,
          complement?: string,
          district: string,
          postalCode: string,
          city: string,
          state: string,
          country: string,
        }
      },
      items: [{
        item: PagSeguro.Item
      }],
    };
    public xml: string;

    constructor(config?: PagSeguro.Config);

    currency(currency?: 'BRL' | 'USD'): PagSeguro;
    reference(reference: string): PagSeguro;
    addItem(item: PagSeguro.Item): PagSeguro
    buyer(buyer: PagSeguro.Buyer): PagSeguro
    shipping(shippingInfo: PagSeguro.ShippingInfo): PagSeguro
    preApproval(preApprovalInfo: PagSeguro.PreApprovalInfo): PagSeguro
    setRedirectURL(url: string): PagSeguro;
    setNotificationURL(url: string): PagSeguro;
    setReviewURL(url: string): PagSeguro;
    send(callback: (error: any, body: string) => void): Request;

  }

  export = PagSeguro;
}
