import UserController from './user.controller';

class UserRoutes {
  public config(app): void {
    app.route('/api/v1/user').get(UserController.get);
    app.route('/api/v1/user/:id').get(UserController.getById);
    app.route('/api/v1/user').post(UserController.create);
    app.route('/api/v1/user/:id').put(UserController.update);
    app.route('/api/v1/user/:id').delete(UserController.delete);
  }

}

export default new UserRoutes;
