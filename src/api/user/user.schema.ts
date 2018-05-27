import * as mongoose from 'mongoose';

export default new mongoose.Schema({
  username: { type: String },
  password: { type: String },
}, { versionKey: false });
