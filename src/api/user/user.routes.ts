import UserController from './user.controller';

class UserRoutes {
  public config(app): void {
    app.route('/api/v1/user').get(UserController.get.bind(UserController));
    app.route('/api/v1/user').post(UserController.create.bind(UserController));
    app.route('/api/v1/user/:id').get(UserController.getById.bind(UserController));
    app.route('/api/v1/user/:id').put(UserController.update.bind(UserController));
    app.route('/api/v1/user/:id').delete(UserController.delete.bind(UserController));
  }
}

export default new UserRoutes;
