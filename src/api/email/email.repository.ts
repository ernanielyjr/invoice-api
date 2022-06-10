import * as mongoose from "mongoose";
import BaseRepository from "../../models/base.respository";
import EmailSchema from "./email.schema";

class EmailRepository extends BaseRepository {
  constructor() {
    super(mongoose.model("Email", EmailSchema));
  }

  get(filters?: any) {
    const newFilters = filters || {};
    if (!newFilters.id) {
      let limit;
      if (newFilters.limit) {
        try {
          limit = parseInt(newFilters.limit, 10);
        } catch (error) {
          console.error("error", error);
        }
      }

      return this.model
        .find()
        .sort({ sent: 1, createdAt: -1 })
        .limit(limit)
        .exec();
    }

    return this.model.findById(newFilters.id).exec();
  }

  listUnsent() {
    return this.model.find({
      sent: false,
    });
  }
}

export default new EmailRepository();
