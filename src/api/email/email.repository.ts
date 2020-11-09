import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import EmailSchema from './email.schema';

class EmailRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Email', EmailSchema));
  }

  get(filters?: any) {
    filters = filters || {};
    if (!filters.id) {
      let limit;
      if (filters.limit) {
        try {
          limit = parseInt(filters.limit, 10);
        } catch (error) {
          console.error('error', error);
        }
      }

      return this.model.find().sort({sent: 1, createdAt: -1}).limit(limit).exec();
    }

    return this.model.findById(filters.id).exec();
  }

  listUnsent() {
    return this.model.find({
      sent: false
    });
  }

}

export default new EmailRepository;
