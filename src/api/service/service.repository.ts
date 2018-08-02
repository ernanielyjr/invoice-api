import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import ServiceSchema from './service.schema';

class ServiceRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Service', ServiceSchema));
  }

  listByCustomer(customerId) {
    return this.model.find({
      _customerId: customerId
    });
  }

}

export default new ServiceRepository;
