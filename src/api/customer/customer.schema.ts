import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  name: String,
  emails: [String],
  phones: [String],

  documentNumber: String,
  documentType: String,
  responsibleName: String,

  invoitceMaturiry: Number,

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
  usePushEach: true,
  versionKey: false
});
