import UserController from './user.controller';

class UserRoutes {
  public config(app): void {
    app.route('/api/v1/users').get(UserController.get);
    app.route('/api/v1/users/:id').get(UserController.getById);
    app.route('/api/v1/users').post(UserController.create);
    app.route('/api/v1/users/:id').put(UserController.update);
    app.route('/api/v1/users/:id').delete(UserController.delete);
  }

}

export default new UserRoutes;
