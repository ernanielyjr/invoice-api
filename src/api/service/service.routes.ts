import ServiceController from './service.controller';

class ServiceRoutes {
  public config(app): void {
    app.route('/api/v1/service').get(ServiceController.get);
    app.route('/api/v1/service/:id').get(ServiceController.getById);
    app.route('/api/v1/service').post(ServiceController.create);
    app.route('/api/v1/service/:id').put(ServiceController.update);
    app.route('/api/v1/service/:id').delete(ServiceController.delete);
  }
}

export default new ServiceRoutes;
