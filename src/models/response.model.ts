import { Response } from 'express';
import * as HttpStatus from 'http-status';

export const httpStatus = HttpStatus;

export enum ErrorMessages {
  GENERIC_ERROR = 'GENERIC_ERROR',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',

  AUTH_INVALID_USERNAME_OR_PASSWORD = 'AUTH_INVALID_USERNAME_OR_PASSWORD',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_MISSING_TOKEN = 'AUTH_MISSING_TOKEN',
}

export class ResponseError {
  constructor(res: Response, message: ErrorMessages | ErrorMessages[], httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    let messageArray: ErrorMessages[];

    if (Array.isArray(message)) {
      messageArray = message;
    } else {
      messageArray = [message];
    }

    return res.status(httpStatus).send({
      result: messageArray,
      success: false
    });
  }
}

export class ResponseOk {
  constructor(res: Response, result: any, httpStatus: number = HttpStatus.OK) {
    return res.status(httpStatus).send({
      result,
      success: true
    });
  }
}
