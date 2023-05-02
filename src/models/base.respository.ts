import { ObjectID } from "bson";
import mongoose from "mongoose";

export default class BaseRepository {
  public model: mongoose.Model<any>;
  public subDocName: string;

  constructor(model: mongoose.Model<any>, subDocName?: string) {
    this.model = model;
    this.subDocName = subDocName;
  }

  filterInputData(data) {
    return data;
  }

  // region CRUD
  create(data) {
    const newData = this.filterInputData(data);
    return this.model.create(newData);
  }

  find(query) {
    return this.model.find(query).exec();
  }

  get(filters?: any) {
    const newFilters = filters || {};
    if (!newFilters.id) {
      let limit;
      if (newFilters.limit) {
        try {
          limit = parseInt(newFilters.limit, 10);
        } catch (error) {
          console.error("error", error);
        }
      }

      return this.model.find().limit(limit).exec();
    }

    return this.model.findById(newFilters.id).exec();
  }

  update(id, data) {
    const updateData = (<any>Object).assign({}, this.filterInputData(data));
    return this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  delete(id) {
    return this.model.findByIdAndRemove(id).exec();
  }
  // endregion

  // region CRUD SubDoc
  createSubDoc(docId, subDocData) {
    if (!this.subDocName) {
      throw "SUB_DOC_NAME_MISSING";
    }

    const newData = this.filterInputData(subDocData);
    newData._id = new ObjectID();

    return this.model
      .findById(docId)
      .exec()
      .then((doc) => {
        doc[this.subDocName].push(newData);
        return doc.save().then((docSaved) => {
          return this.extractSubDoc(docSaved, newData._id);
        });
      });
  }

  getSubDoc(docId, subDocId?) {
    if (!this.subDocName) {
      throw "SUB_DOC_NAME_MISSING";
    }

    let projection = null;
    if (subDocId) {
      projection = {
        [`${this.subDocName}`]: {
          $elemMatch: {
            _id: subDocId,
          },
        },
      };
    }

    return this.model
      .findOne(
        {
          _id: docId,
        },
        projection
      )
      .exec()
      .then((res: any) => {
        if (subDocId) {
          return res && res.postings ? res.postings[0] : null;
        }

        return res ? res.postings : [];
      });
  }

  updateSubDoc(docId, subDocId, subDocData) {
    if (!this.subDocName) {
      throw "SUB_DOC_NAME_MISSING";
    }

    const newData = this.filterInputData(subDocData);

    return this.model
      .findById(docId)
      .exec()
      .then((doc) => {
        const subDocs = doc[this.subDocName];
        if (!subDocs || !subDocs.length) {
          return Promise.reject("SUBDOCS_EMPTY");
        }

        const subDoc = subDocs.id(subDocId);
        if (!subDoc) {
          return Promise.reject("SUBDOC_NOT_EXISTS");
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
    if (!this.subDocName) {
      throw "SUB_DOC_NAME_MISSING";
    }

    return this.model
      .findById(docId)
      .exec()
      .then((doc) => {
        doc[this.subDocName].id(subDocId).remove();
        return doc.save();
      });
  }

  private extractSubDoc(doc: object, subDocId: string) {
    return doc && doc[this.subDocName]
      ? doc[this.subDocName].id(subDocId)
      : null;
  }
  // endregion
}
