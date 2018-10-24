import CustomerController from './customer.controller';

class CustomerRoutes {
  public config(app): void {
    app.route('/api/v1/customer').get(CustomerController.get.bind(CustomerController));
    app.route('/api/v1/customer').post(CustomerController.create.bind(CustomerController));
    app.route('/api/v1/customer/first-charge').post(CustomerController.firstCharge.bind(CustomerController));
    app.route('/api/v1/customer/:id').get(CustomerController.getById.bind(CustomerController));
    app.route('/api/v1/customer/:id').put(CustomerController.update.bind(CustomerController));
    app.route('/api/v1/customer/:id').delete(CustomerController.delete.bind(CustomerController));

    app.route('/api/v1/customer/:id/services').get(CustomerController.listServices.bind(CustomerController));
    app.route('/api/v1/customer/:id/invoices').get(CustomerController.listInvoices.bind(CustomerController));
    app.route('/api/v1/customer/:id/current-invoice').get(CustomerController.currentInvoice.bind(CustomerController));
  }
}

export default new CustomerRoutes;
