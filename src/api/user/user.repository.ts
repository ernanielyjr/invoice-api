import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import UserSchema from './user.schema';

class UserRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('User', UserSchema));
  }

  get(id?) {
    if (!id) {
      return this.model.find().select('-password').exec();
    }
    return this.model.findById(id).select('-password').exec();
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
