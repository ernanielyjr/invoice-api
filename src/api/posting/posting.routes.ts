import PostingController from "./posting.controller";

class PostingRoutes {
  public config(app): void {
    app
      .route("/api/v1/invoice/:invoiceId/posting")
      .get(PostingController.get.bind(PostingController));
    app
      .route("/api/v1/invoice/:invoiceId/posting")
      .post(PostingController.create.bind(PostingController));
    app
      .route("/api/v1/invoice/:invoiceId/posting/:id")
      .get(PostingController.getById.bind(PostingController));
    app
      .route("/api/v1/invoice/:invoiceId/posting/:id")
      .put(PostingController.update.bind(PostingController));
    app
      .route("/api/v1/invoice/:invoiceId/posting/:id")
      .delete(PostingController.delete.bind(PostingController));
  }
}

export default new PostingRoutes();
