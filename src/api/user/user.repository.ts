import * as mongoose from 'mongoose';
import BaseRepository from '../../models/base.respository';
import AuthService from '../auth/auth.service';
import UserSchema from './user.schema';

class UserRepository extends BaseRepository {

  constructor() {
    super(mongoose.model('User', UserSchema));
  }

  public filterInputData(user) {
    const { username, password } = user;
    const passwordEncrypted = AuthService.sha512(password);
    return {
      username,
      password: passwordEncrypted
    };
  }

  findWithPassword(user) {
    return this.model.findOne(user);
  }

}

export default new UserRepository;
