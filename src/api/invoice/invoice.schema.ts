import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  _customerId: mongoose.Schema.Types.ObjectId,
  closed: Boolean,
  paid: Boolean,
  month: Number,
  year: Number,
  postings: [{
    description: String,
    amount: mongoose.Schema.Types.Decimal128,
  }]

}, { versionKey: false });
