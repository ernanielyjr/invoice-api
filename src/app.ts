import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import AuthService from './api/auth/auth.service';
import Routes from './routes';
import DatabaseService from './services/database.service';

class App {
  public app: express.Application;

  private database = DatabaseService;

  constructor() {
    this.app = express();
    this.enableCors();

    this.app.use(this.enableCors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(AuthService.validate);

    this.database.createConnection();

    Routes.config(this.app);
  }

  enableCors() {
    const options: cors.CorsOptions = {
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization'],
      credentials: true,
      methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
      origin: '*',
      preflightContinue: false,
    };

    return cors(options);
  }

  closedataBaseConnection(message, callback) {
    this.database.closeConnection(message, () => callback());
  }

}

export default new App();
