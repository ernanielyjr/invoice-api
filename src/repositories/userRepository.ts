import * as mongoose from 'mongoose';
import UserSchema from '../schemas/userSchema';

class UserRepository {
  private model;

  constructor() {
    this.model = mongoose.model('User', UserSchema);
  }

  getAll() {
    return this.model.find({});
  }

  getById(id) {
    return this.model.findById(id);
  }

  create(user) {
    return this.model.create(user);
  }

  update(id, user) {
    const updateUser = (<any>Object).assign({}, user);
    return this.model.findByIdAndUpdate(id, updateUser, { new: true });
  }

  delete(id) {
    return this.model.findByIdAndRemove(id);
  }

}

export default new UserRepository;
