import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import InvoiceSchema from './invoice.schema';

class InvoiceRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Invoice', InvoiceSchema));
  }

  getOpenedByCustomer(customerId: String) {
    return this.model.findOne({
      _customerId: customerId,
      closed: true,
    });
  }

  getByCustomer(customerId: String) {
    return this.model.find({
      _customerId: customerId,
    });
  }

  getByCompetenceDate(customerId: String, month: Number, year: Number) {
    return this.model.findOne({
      month,
      year,
      _customerId: customerId,
    });
  }

}

export default new InvoiceRepository;
