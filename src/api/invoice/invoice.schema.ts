import * as mongoose from 'mongoose';
import PostingSchema from '../posting/posting.schema';

export default new mongoose.Schema({
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'invoice.customer.required']
  },
  closed: Boolean,
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
  postings: [PostingSchema]

}, {
  usePushEach: true,
  versionKey: false
});
