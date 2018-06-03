import * as mongoose from 'mongoose';

export default class BaseRepository {
  public model: mongoose.Model<any>;
  public subDocName;

  constructor(model: mongoose.Model<any>, subDocName?: string) {
    this.model = model;
    this.subDocName = subDocName;
  }

  public filterInputData(data) {
    return data;
  }

  // region CRUD
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
  // endregion

  // region CRUD SubDoc
  createSubDoc(docId, subDocData) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    const newData = this.filterInputData(subDocData);

    return this.model.findOneAndUpdate({
      _id: docId
    }, {
      $push: {
        [`${this.subDocName}.$`]: newData
      }
    });
  }

  getSubDoc(docId, subDocId?) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    if (subDocId) {
      return this.model.findOne({
        _id: docId,
        [`${this.subDocName}._id`]: subDocId
      })[this.subDocName];
    }

    return this.get(docId)[this.subDocName];
  }

  updateSubDoc(docId, subDocId, subDocData) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    const newData = this.filterInputData(subDocData);

    return this.model.findOneAndUpdate({
      _id: docId,
      [`${this.subDocName}._id`]: subDocId
    }, {
      $set: {
        [`${this.subDocName}.$`]: newData
      }
    });
  }

  deleteSubDoc(docId, subDocId) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    return this.model.findOneAndUpdate({
      _id: docId
    }, {
      $pull: {
        [`${this.subDocName}.$`]: {
          _id: subDocId
        }
      },
    });
  }
  // endregion

}
