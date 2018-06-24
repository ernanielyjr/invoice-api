import * as mongoose from 'mongoose';
import { ObjectID } from 'bson';

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
      return this.model.find();
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
    newData._id = new ObjectID();

    return this.model.findById(docId).exec()
    .then((doc) => {
      doc[this.subDocName].push(newData);
      return doc.save()
      .then((docSaved) => {
        return this.extractSubDoc(docSaved, newData._id);
      });
    });
  }

  getSubDoc(docId, subDocId?) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    let projection = null;
    if (subDocId) {
      projection = {
        [`${this.subDocName}`]: {
          $elemMatch: {
            _id: subDocId
          }
        }
      };
    }

    return this.model.findOne({
      _id: docId,
    }, projection).exec()
    .then((res: any) => {
      if (subDocId) {
        return res && res.postings ? res.postings[0] : null;
      }

      return res ? res.postings : [];
    });
  }

  updateSubDoc(docId, subDocId, subDocData) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    const newData = this.filterInputData(subDocData);

    return this.model.findById(docId).exec()
    .then((doc) => {
      const subDocs = doc[this.subDocName];
      if (!subDocs || !subDocs.length) {
        return Promise.reject('SUBDOCS_EMPTY');
      }

      const subDoc = subDocs.id(subDocId);
      if (!subDoc) {
        return Promise.reject('SUBDOC_NOT_EXISTS');
      }

      Object.keys(newData).forEach((dataKey) => {
        subDoc[dataKey] = newData[dataKey];
      });

      return doc.save().then((docSaved) => {
        return this.extractSubDoc(docSaved, subDocId);
      });
    });
  }

  deleteSubDoc(docId, subDocId) {
    if (!this.subDocName) { throw('SUB_DOC_NAME_MISSING'); }

    return this.model.findById(docId).exec()
    .then((doc) => {
      doc[this.subDocName].id(subDocId).remove();
      return doc.save();
    });
  }

  private extractSubDoc(doc: object, subDocId: string) {
    return doc && doc[this.subDocName] ? doc[this.subDocName].id(subDocId) : null;
  }
  // endregion

}
