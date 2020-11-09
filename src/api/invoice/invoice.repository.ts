import { ObjectID } from 'bson';
import * as mongoose from 'mongoose';
import { Helper } from '../../helper';
import BaseRepository from '../../models/base.respository';
import PostingType from '../../models/posting-type.enum';
import CustomerRepository from '../customer/customer.repository';
import EmailService from '../email/email.service';
import InvoiceSchema from './invoice.schema';

class InvoiceRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Invoice', InvoiceSchema));
  }

  get(filters?: any) {
    const newFilters = filters || {};
    if (!newFilters.id) {
      let limit;
      if (newFilters.limit) {
        try {
          limit = parseInt(newFilters.limit, 10);
        } catch (error) {
          console.error('error', error);
        }
      }

      return this.model.find().populate('customer').limit(limit).exec();
    }

    return this.model.findById(newFilters.id).populate('customer').exec();
  }

  find(query) {
    return this.model.find(query).populate('customer').exec();
  }

  getOpenedByCustomer(customerId: String) {
    return this.model.findOne({
      _customerId: customerId,
      closed: false,
    }).populate('customer');
  }

  getByCustomer(customerId: String) {
    return this.model.find({
      _customerId: customerId,
    }).populate('customer');
  }

  getByCompetenceDate(customerId: String, month: Number, year: Number) {
    return this.model.findOne({
      month,
      year,
      _customerId: customerId,
    }).populate('customer');
  }

  public async closeOneInvoice(invoice) {
    const totalIncome = invoice.postings
      .filter(posting => posting.type === PostingType.income)
      .reduce((sum, posting) => sum + posting.amount, 0);

    let previousBalance = invoice.postings
      .filter(posting => posting.type === PostingType.balance)
      .reduce((sum, posting) => sum + posting.amount, 0);

    previousBalance = totalIncome + previousBalance;

    if (previousBalance > 0) {
      let charges = Math.round((previousBalance * (0.02 + 0.01)) * 100) / 100;
      if (charges === 0) {
        charges = -0.01;
      }

      invoice.postings.push({
        type: PostingType.charges,
        description: 'Encargos',
        amount: charges,
      });
    }

    const totalAmount = Helper.sumPostingsAmount(invoice);
    const customer = await CustomerRepository.get({ id: invoice._customerId });

    const dueDate = new Date(invoice.year, invoice.month, customer.invoiceMaturity || 25);

    invoice.dueDate = dueDate;
    invoice.amount = totalAmount;
    invoice.closed = true;
    invoice.paid = invoice.amount <= 0;

    try {
      await invoice.save();

    } catch (err) {
      console.error('INVOICE_CLOSE_ERROR', err, invoice);
    }

    try {
      const lateInvoices = await this.find({
        _customerId: new ObjectID(invoice._customerId),
        paid: {
          $ne: true
        }, // TODO: mudar para paid: false em mar/2019
        $or: [{
          month: {
            $lt: invoice.month
          },
          year: invoice.year
        }, {
          year: {
            $lt: invoice.year
          }
        }]
      });

      for (const lateInvoice of lateInvoices) {
        lateInvoice.paid = true;
        lateInvoice.deferredPayment = true;
        lateInvoice.save();
      }

    } catch (err) {
      console.error('INVOICE_UPDATE_LATE', err, invoice);
    }

    try {
      await EmailService.invoiceClosed(customer, invoice);

    } catch (err) {
      console.error('INVOICE_CLOSE_EMAIL_ERROR', err, invoice);
    }

    try {
      await CustomerRepository.generateNextInvoice(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        invoice._customerId,
        invoice.amount
      );

    } catch (err) {
      console.error('INVOICE_OPEN_ERROR', err);
    }
  }
}

export default new InvoiceRepository;
