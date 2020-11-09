import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import UserSchema from './user.schema';

class UserRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('User', UserSchema));
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

      return this.model.find().select('-password').limit(limit).exec();
    }

    return this.model.findById(filters.id).select('-password').exec();
  }

  public filterInputData(user) {
    const { username, password } = user;
    const passwordEncrypted = AuthService.sha512(password);
    return {
      username,
      password: passwordEncrypted
    };
  }

  findWithPassword(data) {
    const newData = this.filterInputData(data);
    return this.model.findOne(newData);
  }

}

export default new UserRepository;
