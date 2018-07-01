import CustomerController from './customer.controller';

class CustomerRoutes {
  public config(app): void {
    app.route('/api/v1/customer').get(CustomerController.get);
    app.route('/api/v1/customer/:id').get(CustomerController.getById);
    app.route('/api/v1/customer').post(CustomerController.create);
    app.route('/api/v1/customer/:id').put(CustomerController.update);
    app.route('/api/v1/customer/:id').delete(CustomerController.delete);
  }
}

export default new CustomerRoutes;
