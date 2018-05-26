import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: String }
});

export default userSchema;
