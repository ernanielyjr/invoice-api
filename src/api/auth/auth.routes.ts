import AuthController from './auth.controller';

class AuthRoutes {
  public authRegExp = /^\/api\/v\d+\/(authenticate|payment\/.+)$/;

  public config(app): void {
    app.route('/api/v1/authenticate').post(AuthController.login.bind(AuthController));
  }
}

export default new AuthRoutes;
