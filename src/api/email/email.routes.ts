import EmailController from "./email.controller";

class EmailRoutes {
  public config(app): void {
    app
      .route("/api/v1/email/unsent")
      .get(EmailController.listUnsent.bind(EmailController));
    app
      .route("/api/v1/email/send-all")
      .get(EmailController.sendAll.bind(EmailController));

    app.route("/api/v1/email").get(EmailController.get.bind(EmailController));
    app
      .route("/api/v1/email")
      .post(EmailController.create.bind(EmailController));
    app
      .route("/api/v1/email/:id")
      .get(EmailController.getById.bind(EmailController));
    app
      .route("/api/v1/email/:id")
      .put(EmailController.update.bind(EmailController));
    app
      .route("/api/v1/email/:id")
      .delete(EmailController.delete.bind(EmailController));
  }
}

export default new EmailRoutes();
