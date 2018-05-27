import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import CustomerSchema from './customer.schema';

class CustomerRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Customer', CustomerSchema));
  }

}

export default new CustomerRepository;
