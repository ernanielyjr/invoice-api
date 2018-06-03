import { ErrorMessages, ResponseError, ResponseOk, httpStatus } from '../../models/response.model';
import PostingRepository from './posting.repository';

class PostingController {
  constructor() { }

  get(req, res) {
    const { invoiceId } = req.params;

    PostingRepository.getSubDoc(invoiceId).then((postings) => {
      new ResponseOk(res, postings || []);

    }).catch((err) => {
      console.error('POSTING_GET_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  getById(req, res) {
    const { invoiceId, id } = req.params;

    PostingRepository.getSubDoc(invoiceId, id).then((posting) => {
      if (posting) {
        new ResponseOk(res, posting);
      } else {
        new ResponseError(res, ErrorMessages.POSTING_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('POSTING_GET_BY_ID_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  create(req, res) {
    const { invoiceId } = req.params;

    PostingRepository.createSubDoc(invoiceId, req.body).then((posting) => {
      new ResponseOk(res, posting, httpStatus.CREATED);

    }).catch((err) => {
      console.error('POSTING_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  update(req, res) {
    const { invoiceId, id } = req.params;

    PostingRepository.updateSubDoc(invoiceId, id, req.body).then((posting) => {
      if (posting) {
        new ResponseOk(res, posting);
      } else {
        new ResponseError(res, ErrorMessages.POSTING_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('POSTING_CREATE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

  delete(req, res) {
    const { invoiceId, id } = req.params;

    PostingRepository.deleteSubDoc(invoiceId, id).then((posting) => {
      if (posting) {
        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.POSTING_NOT_FOUND);
      }

    }).catch((err) => {
      console.error('POSTING_DELETE_ERROR', err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    });
  }

}

export default new PostingController;
