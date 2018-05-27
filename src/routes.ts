import AuthRoutes from './api/auth/auth.routes';
import UserRoutes from './api/user/user.routes';

class Routes {
  public config(app): void {
    app.route('/').get((req, res) => res.send({ version: '0.0.1' }));

    AuthRoutes.config(app);
    UserRoutes.config(app);
  }

}

export default new Routes;
