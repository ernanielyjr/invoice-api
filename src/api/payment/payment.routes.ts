import PaymentController from './payment.controller';

class InvoiceRoutes {
  public config(app): void {
    app.route('/api/v1/payment/:id').get(PaymentController.pay.bind(PaymentController));
    app.route('/api/v1/payment/:id/notify').post(PaymentController.notify.bind(PaymentController));
  }
}

export default new InvoiceRoutes;
