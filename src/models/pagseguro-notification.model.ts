const $transactionType = [];
$transactionType[1] = "Pagamento";

const $transactionStatus = [];
$transactionStatus[1] = "Aguardando pagamento";
$transactionStatus[2] = "Em análise";
$transactionStatus[3] = "Paga";
$transactionStatus[4] = "Disponível";
$transactionStatus[5] = "Em disputa";
$transactionStatus[6] = "Devolvida";
$transactionStatus[7] = "Cancelada";
$transactionStatus[8] = "Debitado";
$transactionStatus[9] = "Retenção temporária";

const $paymentMethodType = [];
$paymentMethodType[1] = "Cartão de crédito";
$paymentMethodType[2] = "Boleto";
$paymentMethodType[3] = "Débito online (TEF)";
$paymentMethodType[4] = "Saldo PagSeguro";
$paymentMethodType[5] = "Oi Paggo";
$paymentMethodType[7] = "Depósito em conta";

const $paymentMethodCode = [];
$paymentMethodCode[101] = "Cartão de crédito Visa";
$paymentMethodCode[102] = "Cartão de crédito MasterCard";
$paymentMethodCode[103] = "Cartão de crédito American Express";
$paymentMethodCode[104] = "Cartão de crédito Diners";
$paymentMethodCode[105] = "Cartão de crédito Hipercard";
$paymentMethodCode[106] = "Cartão de crédito Aura";
$paymentMethodCode[107] = "Cartão de crédito Elo";
$paymentMethodCode[108] = "Cartão de crédito PLENOCard";
$paymentMethodCode[109] = "Cartão de crédito PersonalCard";
$paymentMethodCode[110] = "Cartão de crédito JCB";
$paymentMethodCode[111] = "Cartão de crédito Discover";
$paymentMethodCode[112] = "Cartão de crédito BrasilCard";
$paymentMethodCode[113] = "Cartão de crédito FORTBRASIL";
$paymentMethodCode[114] = "Cartão de crédito CARDBAN";
$paymentMethodCode[115] = "Cartão de crédito VALECARD";
$paymentMethodCode[116] = "Cartão de crédito Cabal";
$paymentMethodCode[117] = "Cartão de crédito Mais!";
$paymentMethodCode[118] = "Cartão de crédito Avista";
$paymentMethodCode[119] = "Cartão de crédito GRANDCARD";
$paymentMethodCode[120] = "Cartão de crédito Sorocred";
$paymentMethodCode[122] = "Cartão de crédito Up Policard";
$paymentMethodCode[123] = "Cartão de crédito Banese Card";
$paymentMethodCode[201] = "Boleto Bradesco";
$paymentMethodCode[202] = "Boleto Santander";
$paymentMethodCode[301] = "Débito online Bradesco";
$paymentMethodCode[302] = "Débito online Itaú";
$paymentMethodCode[303] = "Débito online Unibanco";
$paymentMethodCode[304] = "Débito online Banco do Brasil";
$paymentMethodCode[305] = "Débito online Banco Real";
$paymentMethodCode[306] = "Débito online Banrisul";
$paymentMethodCode[307] = "Débito online HSBC";
$paymentMethodCode[401] = "Saldo PagSeguro";
$paymentMethodCode[501] = "Oi Paggo";
$paymentMethodCode[701] = "Depósito em conta - Banco do Brasil";

const $shippingType = [];
$shippingType[1] = "Encomenda normal (PAC)";
$shippingType[2] = "SEDEX";
$shippingType[3] = "Tipo de frete não especificado";

interface Transaction {
  date: string;
  lastEventDate: string;
  code: string;
  reference?: string;
  type: number;
  status: PagSeguroTransactionStatus;
  cancellationSource?: "INTERNAL" | "EXTERNAL";
  paymentMethod: {
    type: number;
    code: number;
  };
  paymentLink?: string;
  grossAmount: string;
  discountAmount: number;
  feeAmount: number;
  netAmount: number;
  escrowEndDate?: string;
  extraAmount: number;
  creditorFees: {
    installmentFeeAmount: number;
    intermediationRateAmount: number;
    intermediationFeeAmount: number;
  };
  installmentCount: number;
  itemCount: number;
  items: {
    item: {
      id: string;
      description: string;
      amount: number;
      quantity: number;
    };
  };
  sender: {
    email: string;
    name?: string;
    phone: {
      areaCode?: number;
      number?: number;
    };
    documents: {
      document: {
        type: string;
        value: string;
      };
    };
  };
  shipping: {
    type: number;
    cost: number;
    address: {
      country?: "BRA";
      state?: string;
      city?: string;
      postalCode?: number;
      district?: string;
      street?: string;
      number?: string;
      complement?: string;
    };
  };
  gatewaySystem?: {
    type: string;
    acquirerName: string;
    authorizationCode?: string;
    nsu?: string;
    tid?: string;
    establishmentCode?: string;
    rawCode?: any;
    rawMessage?: any;
    normalizedCode?: any;
    normalizedMessage?: any;
  };
  primaryReceiver?: {
    publicKey: string;
  };
}

export enum PagSeguroNotificationType {
  TRANSACTION = "transaction",
}

export enum PagSeguroTransactionStatus {
  // TODO: quando nao tem nenhum tipo
  AGUARDANDO_PAGAMENTO = "1",
  EM_ANALISE = "2",
  PAGA = "3",
  DISPONIVEL = "4",
  EM_DISPUTA = "5",
  DEVOLVIDA = "6",
  CANCELADA = "7",
  DEBITADO = "8",
  RETENCAO_TEMPORARIA = "9",
}

export interface PagSeguroNotification {
  errors: {
    error: {
      code: string;
      message: string;
    }[];
  };
  transaction: Transaction;
}

export interface PagSeguroSession {
  session: {
    id: string;
  };
}

export const paidStatus = [
  PagSeguroTransactionStatus.PAGA,
  PagSeguroTransactionStatus.DISPONIVEL,
];
export const transactionType = $transactionType;
export const transactionStatus = $transactionStatus;
export const paymentMethodType = $paymentMethodType;
export const paymentMethodCode = $paymentMethodCode;
export const shippingType = $shippingType;
