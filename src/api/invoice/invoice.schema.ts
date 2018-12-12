import * as mongoose from 'mongoose';
import { PagSeguroTransactionStatus } from '../../models/pagseguro-notification.model';
import PostingSchema from '../posting/posting.schema';

const invoiceSchema = new mongoose.Schema({
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'invoice.customer.required']
  },
  closed: Boolean,
  dueDate: Date,
  month: {
    type: Number,
    min: 1,
    max: 12,
    required: [true, 'invoice.month.required']
  },
  year: {
    type: Number,
    minlength: 4,
    required: [true, 'invoice.year.required']
  },
  amount: Number,
  postings: [PostingSchema],
  paymentCode: String,
  paid: Boolean, // TODO: ainda faz sentido?
  lastStatus: {
    type: String,
    enum: Object.keys(PagSeguroTransactionStatus).map(key => PagSeguroTransactionStatus[key]),
    required: [false, 'invoice.lastStatus.required']
  }

}, {
  timestamps: true,
  usePushEach: true,
  versionKey: false,
});

invoiceSchema.set('toObject', { virtuals: true });
invoiceSchema.set('toJSON', { virtuals: true });

invoiceSchema.virtual('customer', {
  ref: 'Customer',
  localField: '_customerId',
  foreignField: '_id',
  justOne: true,
});

export default invoiceSchema;
