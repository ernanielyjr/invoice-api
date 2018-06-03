import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  description: String,
  amount: mongoose.Schema.Types.Decimal128,

}, { versionKey: false });
