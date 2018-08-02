import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  cc: [String],
  cco: [String],
  bcc: [String],
  attachments: [String],
  subject: {
    type: String,
    required: [true, 'email.subject.required']
  },
  body: {
    type: String,
    required: [true, 'email.body.required']
  },
  sent: {
    type: Boolean,
    default: false
  },

}, {
  timestamps: true,
  usePushEach: true,
  versionKey: false
});
