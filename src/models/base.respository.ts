import * as mongoose from 'mongoose';

export default class BaseRepository {
  public model: mongoose.Model<any>;

  constructor(model: mongoose.Model<any>) {
    this.model = model;
  }

  public filterInputData(data) {
    return data;
  }

  public filterOutputData(data) {
    return data;
  }

  public create(data) {
    const newData = this.filterInputData(data);
    return this.model.create(newData);
  }

  public get(id?) {
    if (!id) {
      return this.model.find({});
    }
    return this.model.findById(id);
  }

  public update(id, data) {
    const updateData = (<any>Object).assign({}, this.filterInputData(data));
    return this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  public delete(id) {
    return this.model.findByIdAndRemove(id);
  }

}
