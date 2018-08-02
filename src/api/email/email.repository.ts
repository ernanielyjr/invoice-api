import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import EmailSchema from './email.schema';

class EmailRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Email', EmailSchema));
  }

  listUnsent() {
    return this.model.find({
      sent: false
    });
  }

}

export default new EmailRepository;
