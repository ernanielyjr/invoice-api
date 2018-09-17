import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  name: String,
  emails: [String],
  phones: [String],

  documentNumber: String,
  documentType: String,
  responsibleName: String,

  invoiceMaturity: {
    type: Number,
    min: 1,
    max: 31,
    required: [true, 'invoice.invoiceMaturity.required']
  },

  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    country: String,
  },

  notes: [String],

}, {
  timestamps: true,
  usePushEach: true,
  versionKey: false
});
