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
  response: {
    accepted: [String],
    rejected: [],
    envelopeTime: Number,
    messageTime: Number,
    messageSize: Number,
    response: String,
    envelope: {
      from: String,
      to: [String]
    },
    messageId: String
  }

}, {
  timestamps: true,
  usePushEach: true,
  versionKey: false
});
