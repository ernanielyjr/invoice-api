import AuthRoutes from './api/auth/auth.routes';
import UserRoutes from './api/user/user.routes';
import CustomerRoutes from './api/customer/customer.routes';
import InvoiceRoutes from './api/invoice/invoice.routes';
import PostingRoutes from './api/posting/posting.routes';

class Routes {
  public config(app): void {
    app.route('/').get((req, res) => res.send({ version: '0.0.1' }));

    AuthRoutes.config(app);
    UserRoutes.config(app);
    CustomerRoutes.config(app);
    InvoiceRoutes.config(app);
    PostingRoutes.config(app);
  }

}

export default new Routes;
