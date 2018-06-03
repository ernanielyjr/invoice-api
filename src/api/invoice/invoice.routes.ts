import InvoiceController from './invoice.controller';

class InvoiceRoutes {
  public config(app): void {
    app.route('/api/v1/invoice').get(InvoiceController.get);
    app.route('/api/v1/invoice/:id').get(InvoiceController.getById);
    app.route('/api/v1/invoice').post(InvoiceController.create);
    app.route('/api/v1/invoice/:id').put(InvoiceController.update);
    app.route('/api/v1/invoice/:id').delete(InvoiceController.delete);
  }

}

export default new InvoiceRoutes;
