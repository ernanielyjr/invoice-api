import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import ServiceSchema from './service.schema';

class ServiceRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('Service', ServiceSchema));
  }

}

export default new ServiceRepository;
