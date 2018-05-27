import AuthController from './auth.controller';

class AuthRoutes {
  public authRegExp = /^\/api\/v\d+\/authenticate$/;

  public config(app): void {
    app.route('/api/v1/authenticate').post(AuthController.login);
  }

}

export default new AuthRoutes;
