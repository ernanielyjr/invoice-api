import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import InvoiceSchema from './invoice.schema';

class InvoiceRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Invoice', InvoiceSchema));
  }

}

export default new InvoiceRepository;
