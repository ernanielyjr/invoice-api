import CustomerController from './customer.controller';
import InvoiceController from '../invoice/invoice.controller';

class CustomerRoutes {
  public config(app): void {
    app.route('/api/v1/customer').get(CustomerController.get.bind(CustomerController));
    app.route('/api/v1/customer').post(CustomerController.create.bind(CustomerController));
    app.route('/api/v1/customer/:id').get(CustomerController.getById.bind(CustomerController));
    app.route('/api/v1/customer/:id').put(CustomerController.update.bind(CustomerController));
    app.route('/api/v1/customer/:id').delete(CustomerController.delete.bind(CustomerController));

    app.route('/api/v1/customer/:id/services').get(CustomerController.listServices.bind(CustomerController));
    app.route('/api/v1/customer/:id/invoices').get(CustomerController.listInvoices.bind(CustomerController));
    app.route('/api/v1/customer/:id/current-invoice').get(CustomerController.currentInvoice.bind(CustomerController));
    app.route('/api/v1/customer/:customerId/first-invoice').get(InvoiceController.customerFirstInvoice.bind(InvoiceController));
  }
}

export default new CustomerRoutes;
