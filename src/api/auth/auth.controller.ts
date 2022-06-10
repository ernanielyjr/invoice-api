import { Request, Response } from "express";
import {
  ErrorMessages,
  ResponseError,
  ResponseOk,
  httpStatus,
} from "../../models/response.model";
import UserRepository from "../user/user.repository";
import AuthService from "./auth.service";

class AuthController {
  login(req: Request, res: Response) {
    UserRepository.findWithPassword(req.body)
      .then((user) => {
        if (user) {
          const token = `Bearer ${AuthService.sign(user.id)}`;
          new ResponseOk(res, { token });
        } else {
          console.error("USER_NOT_FOUND", req.body);
          new ResponseError(
            res,
            ErrorMessages.AUTH_INVALID_USERNAME_OR_PASSWORD,
            httpStatus.UNAUTHORIZED
          );
        }
      })
      .catch((err) => {
        console.error("CANNOT_LOGIN", req.body);
        new ResponseError(res, ErrorMessages.GENERIC_ERROR);
      });
  }
}

export default new AuthController();
