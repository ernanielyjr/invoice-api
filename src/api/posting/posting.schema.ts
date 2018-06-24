import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  description: String,
  amount: Number,

}, {
  usePushEach: true,
  versionKey: false
});
