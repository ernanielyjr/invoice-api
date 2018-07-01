import PostingController from './posting.controller';

class PostingRoutes {
  public config(app): void {
    app.route('/api/v1/invoice/:invoiceId/posting').get(PostingController.get);
    app.route('/api/v1/invoice/:invoiceId/posting/:id').get(PostingController.getById);
    app.route('/api/v1/invoice/:invoiceId/posting').post(PostingController.create);
    app.route('/api/v1/invoice/:invoiceId/posting/:id').put(PostingController.update);
    app.route('/api/v1/invoice/:invoiceId/posting/:id').delete(PostingController.delete);
  }
}

export default new PostingRoutes;
