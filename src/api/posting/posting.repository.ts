import mongoose from "mongoose";
import BaseRepository from "../../models/base.respository";
import invoiceSchema from "../invoice/invoice.schema";

class PostingRepository extends BaseRepository {
  constructor() {
    super(mongoose.model("Invoice", invoiceSchema), "postings");
  }
}

export default new PostingRepository();
