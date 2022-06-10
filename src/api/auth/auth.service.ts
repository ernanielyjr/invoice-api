import * as crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import AppConfig from "../../configs/app.config";
import AuthRoutes from "./auth.routes";
import {
  ResponseError,
  ErrorMessages,
  httpStatus,
} from "../../models/response.model";

class AuthService {
  constructor() {}

  sha512(password: string) {
    const hash = crypto.createHmac("sha512", AppConfig.passKey);
    hash.update(password);
    return hash.digest("hex");
  }

  sign(userId: string) {
    return jwt.sign({ id: userId }, AppConfig.jwt.secret, {
      expiresIn: AppConfig.jwt.expiration,
    });
  }

  validate(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
    let token;

    if (authorization) {
      token = authorization.split(" ")[1];
    }

    if (token) {
      jwt.verify(token, AppConfig.jwt.secret, (err, decoded) => {
        if (err) {
          console.error("INVALID_TOKEN", err);
          new ResponseError(
            res,
            ErrorMessages.AUTH_INVALID_TOKEN,
            httpStatus.UNAUTHORIZED
          );
        } else {
          next();
        }
      });
    } else if (AuthRoutes.authRegExp.test(req.url)) {
      next();
    } else {
      console.error("MISSING_TOKEN", authorization);
      new ResponseError(
        res,
        ErrorMessages.AUTH_MISSING_TOKEN,
        httpStatus.FORBIDDEN
      );
    }
  }
}

export default new AuthService();
