import { Request, Response } from 'express';
import AuthRoutes from './api/auth/auth.routes';
import CustomerRoutes from './api/customer/customer.routes';
import EmailRoutes from './api/email/email.routes';
import InvoiceRoutes from './api/invoice/invoice.routes';
import PostingRoutes from './api/posting/posting.routes';
import ServiceRoutes from './api/service/service.routes';
import UserRoutes from './api/user/user.routes';

class Routes {
  public config(app): void {
    app.route('/').get((req: Request, res: Response) => res.send({ version: '0.0.1' }));

    AuthRoutes.config(app);
    CustomerRoutes.config(app);
    EmailRoutes.config(app);
    InvoiceRoutes.config(app);
    PostingRoutes.config(app);
    ServiceRoutes.config(app);
    UserRoutes.config(app);
  }

}

export default new Routes;
