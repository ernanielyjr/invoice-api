import * as mongoose from 'mongoose';
import PostingSchema from '../posting/posting.schema';

export default new mongoose.Schema({
  _customerId: mongoose.Schema.Types.ObjectId,
  closed: Boolean,
  paid: Boolean,
  month: Number,
  year: Number,
  postings: [PostingSchema]

}, { versionKey: false });
