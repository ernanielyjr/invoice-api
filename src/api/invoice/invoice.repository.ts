import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import PostingType from '../../models/posting-type.enum';
import CustomerRepository from '../customer/customer.repository';
import EmailService from '../email/email.service';
import InvoiceSchema from './invoice.schema';

class InvoiceRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Invoice', InvoiceSchema));
  }

  getOpenedByCustomer(customerId: String) {
    return this.model.findOne({
      _customerId: customerId,
      closed: false,
    });
  }

  getByCustomer(customerId: String) {
    return this.model.find({
      _customerId: customerId,
    });
  }

  getByCompetenceDate(customerId: String, month: Number, year: Number) {
    return this.model.findOne({
      month,
      year,
      _customerId: customerId,
    });
  }

  public async closeOneInvoice(invoice) {
    const totalIncome = invoice.postings
      .filter(posting => posting.amount > 0 && posting.type !== PostingType.balance)
      .reduce((sum, posting) => sum + posting.amount, 0);

    let previousBalance = invoice.postings
      .filter(posting => posting.type === PostingType.balance)
      .reduce((sum, posting) => sum + posting.amount, 0);

    previousBalance = totalIncome + previousBalance;

    if (previousBalance < 0) {
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

    const totalAmount = invoice.postings.reduce((sum, posting) => sum + posting.amount, 0);
    const customer = await CustomerRepository.get(invoice._customerId);

    const dueDate = new Date(invoice.year, invoice.month, customer.invoiceMaturity || 25);

    invoice.dueDate = dueDate;
    invoice.amount = Math.round(totalAmount * 100) / 100;
    invoice.closed = true;

    try {
      await invoice.save();

    } catch (err) {
      console.error('INVOICE_CLOSE_ERROR', err, invoice);
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
