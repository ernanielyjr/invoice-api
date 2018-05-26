import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as morgan from 'morgan';
import Auth from './config/auth';
import DataBase from './config/db';
import UserController from './controllers/userController';

class App {
  public app: express.Application;
  private morgan: morgan.Morgan;
  private bodyParser;
  private database: DataBase;

  constructor() {
    this.app = express();
    this.enableCors();
    this.middleware();
    this.database = new DataBase();
    this.dataBaseConnection();
    this.routes();
  }

  enableCors() {
    const options: cors.CorsOptions = {
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token'],
      credentials: true,
      methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
      origin: '*',
      preflightContinue: false,
    };

    this.app.use(cors(options));
  }

  dataBaseConnection() {
    this.database.createConnection();
  }

  closedataBaseConnection(message, callback) {
    this.database.closeConnection(message, () => callback());
  }

  middleware() {
    this.app.use(morgan('dev'));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  routes() {

    this.app.route('/').get((req, res) => {
      res.send({
        version: '0.0.2',
      });
    });

    this.app.use(Auth.validate);

    this.app.route('/api/v1/users').get(UserController.get);
    this.app.route('/api/v1/users/:id').get(UserController.getById);
    this.app.route('/api/v1/users').post(UserController.create);
    this.app.route('/api/v1/users/:id').put(UserController.update);
    this.app.route('/api/v1/users/:id').delete(UserController.delete);
  }
}

export default new App();
