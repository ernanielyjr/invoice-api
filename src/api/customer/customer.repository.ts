import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import PostingType from '../../models/posting-type.enum';
import InvoiceRepository from '../invoice/invoice.repository';
import ServiceRepository from '../service/service.repository';
import CustomerSchema from './customer.schema';

class CustomerRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Customer', CustomerSchema));
  }

  public generateNextInvoice(year: number, month: number, customerId: string, amount: number) {
    return new Promise(async (resolve, reject) => {

      const nextInvoiceDate = new Date(year, month, 1);
      const nextInvoice = {
        month: nextInvoiceDate.getMonth() + 1,
        year: nextInvoiceDate.getFullYear(),
        _customerId: customerId,
        closed: false,
        postings: []
      };

      nextInvoice.postings.push({
        amount,
        type: PostingType.balance,
        description: 'Saldo da Fatura Anterior',
      });

      const customerServices = await ServiceRepository.find({
        _customerId: customerId,
        inactive: false
      });

      customerServices.forEach((service) => {
        // TODO: check recurrency
        nextInvoice.postings.push({
          _serviceId: service._id,
          type: PostingType.service,
          description: service.description,
          amount: service.amount,
        });
      });

      try {
        const newInvoice = await InvoiceRepository.create(nextInvoice);
        resolve(newInvoice);

      } catch (err) {
        console.error('INVOICE_OPEN_ERROR', err, nextInvoice);
        reject(nextInvoice);
      }
    });
  }

  public async generateFirstInvoice(customerId: string) {
    const today = new Date();
    const baseYear = today.getFullYear();
    const baseMonth = today.getMonth() - 1;

    return await this.generateNextInvoice(baseYear, baseMonth, customerId, 0);
  }

}

export default new CustomerRepository;
