import AuthController from "./auth.controller";
import { Express } from "express";

class AuthRoutes {
  public authRegExp =
    /^\/api\/v\d+\/(authenticate|payment\/.+|email\/send-all)$/;

  public config(app: Express): void {
    app
      .route("/api/v1/authenticate")
      .post(AuthController.login.bind(AuthController));
  }
}

export default new AuthRoutes();
