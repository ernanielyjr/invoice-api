import * as mongoose from 'mongoose';
import PostingType from '../../models/posting-type.enum';

export default new mongoose.Schema({
  _serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  type: {
    type: String,
    enum: Object.keys(PostingType),
    required: [true, 'service.postings.type.required']
  },
  description: String,
  amount: Number,
  notificationCode: String,

}, {
  timestamps: true,
  usePushEach: true,
  versionKey: false
});
