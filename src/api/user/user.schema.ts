import mongoose from "mongoose";

export default new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
  },
  {
    timestamps: true,
    usePushEach: true,
    versionKey: false,
  }
);
