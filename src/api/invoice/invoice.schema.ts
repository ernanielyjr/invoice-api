import * as mongoose from 'mongoose';
import PostingSchema from '../posting/posting.schema';

export default new mongoose.Schema({
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'invoice.customer.required']
  },
  closed: Boolean,
  day: { // TODO: change to store full date on next month relative to "month" property
    type: Number,
    min: 1,
    max: 31,
    required: [true, 'invoice.day.required']
  },
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
  paid: Boolean,

}, {
  timestamps: true,
  usePushEach: true,
  versionKey: false
});
