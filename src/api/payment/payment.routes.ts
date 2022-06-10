import PaymentController from "./payment.controller";

class InvoiceRoutes {
  public config(app): void {
    app
      .route("/api/v1/payment/session-id")
      .get(PaymentController.sessionId.bind(PaymentController));
    app
      .route("/api/v1/payment/:id")
      .get(PaymentController.pay.bind(PaymentController));
    app
      .route("/api/v1/payment/:id/notify")
      .post(PaymentController.notify.bind(PaymentController));
    app
      .route("/api/v1/payment/:id/code")
      .get(PaymentController.code.bind(PaymentController));
    app
      .route("/api/v1/payment/:id/billet")
      .post(PaymentController.billet.bind(PaymentController));
  }
}

export default new InvoiceRoutes();
