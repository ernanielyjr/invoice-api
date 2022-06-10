import { Request, Response } from "express";
import { Helper } from "../../helper";
import {
  ErrorMessages,
  httpStatus,
  ResponseError,
  ResponseOk,
} from "../../models/response.model";
import InvoiceRepository from "../invoice/invoice.repository";
import PostingRepository from "./posting.repository";

class PostingController {
  constructor() {}

  async get(req: Request, res: Response) {
    const { invoiceId } = req.params;

    try {
      const postings = await PostingRepository.getSubDoc(invoiceId);
      new ResponseOk(res, postings || []);
    } catch (err) {
      console.error("POSTING_GET_ERROR", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async getById(req: Request, res: Response) {
    const { invoiceId, id } = req.params;

    try {
      const posting = await PostingRepository.getSubDoc(invoiceId, id);
      if (posting) {
        new ResponseOk(res, posting);
      } else {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }
    } catch (err) {
      console.error("POSTING_GET_BY_ID_ERROR", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async create(req: Request, res: Response) {
    const { invoiceId } = req.params;

    try {
      // TODO: nao permitir quando a fatura estiver paga!
      const posting = await PostingRepository.createSubDoc(invoiceId, req.body);

      const invoice = await InvoiceRepository.get({ id: invoiceId });
      if (invoice && invoice.closed && invoice.amount) {
        invoice.amount = Helper.sumPostingsAmount(invoice);
        await invoice.save();
      }

      new ResponseOk(res, posting, httpStatus.CREATED);
    } catch (err) {
      console.error("POSTING_CREATE_ERROR", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async update(req: Request, res: Response) {
    const { invoiceId, id } = req.params;

    try {
      // TODO: nao permitir quando a fatura estiver paga!
      const posting = await PostingRepository.updateSubDoc(
        invoiceId,
        id,
        req.body
      );
      if (posting) {
        const invoice = await InvoiceRepository.get({ id: invoiceId });
        if (invoice && invoice.closed && invoice.amount) {
          invoice.amount = Helper.sumPostingsAmount(invoice);
          await invoice.save();
        }

        new ResponseOk(res, posting);
      } else {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }
    } catch (err) {
      console.error("POSTING_CREATE_ERROR", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }

  async delete(req: Request, res: Response) {
    const { invoiceId, id } = req.params;

    try {
      // TODO: nao permitir quando a fatura estiver paga!
      const posting = await PostingRepository.deleteSubDoc(invoiceId, id);
      if (posting) {
        const invoice = await InvoiceRepository.get({ id: invoiceId });
        if (invoice && invoice.closed && invoice.amount) {
          invoice.amount = Helper.sumPostingsAmount(invoice);
          await invoice.save();
        }

        new ResponseOk(res, null, httpStatus.NO_CONTENT);
      } else {
        new ResponseError(res, ErrorMessages.ITEM_NOT_FOUND);
      }
    } catch (err) {
      console.error("POSTING_DELETE_ERROR", err, req.body);
      new ResponseError(res, ErrorMessages.GENERIC_ERROR);
    }
  }
}

export default new PostingController();
