import InvoiceController from './invoice.controller';

class InvoiceRoutes {
  public config(app): void {
    app.route('/api/v1/invoice/close').get(InvoiceController.closeAllInvoices.bind(InvoiceController));
    app.route('/api/v1/invoice/first/:customerId').get(InvoiceController.customerFirstInvoice.bind(InvoiceController));

    app.route('/api/v1/invoice').get(InvoiceController.get.bind(InvoiceController));
    app.route('/api/v1/invoice').post(InvoiceController.create.bind(InvoiceController));
    app.route('/api/v1/invoice/:id').get(InvoiceController.getById.bind(InvoiceController));
    app.route('/api/v1/invoice/:id').put(InvoiceController.update.bind(InvoiceController));
    app.route('/api/v1/invoice/:id').delete(InvoiceController.delete.bind(InvoiceController));
  }
}

export default new InvoiceRoutes;
