import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  _serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  description: String,
  amount: Number,

}, {
  usePushEach: true,
  versionKey: false
});
