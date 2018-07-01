import * as mongoose from 'mongoose';
import RecurrenceType from '../../models/recurrence-type.enum';

export default new mongoose.Schema({
  _customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'service.customer.required']
  },
  description: {
    type: String,
    required: [true, 'service.description.required']
  },
  amount: {
    type: Number,
    required: [true, 'service.amount.required']
  },
  recurrenceType: {
    type: String,
    default: RecurrenceType.monthly,
    enum: Object.keys(RecurrenceType),
    required: [true, 'service.recurrence.type.required']
  },
  recurrenceInterval: {
    type: Number,
    default: 1,
    required: [true, 'service.recurrence.interval.required']
  },
  inactive: {
    type: Boolean,
    default: false
  },
}, {
  usePushEach: true,
  versionKey: false
});
