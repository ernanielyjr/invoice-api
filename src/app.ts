import cors from "cors";
import express, { json, urlencoded } from "express";
import morgan from "morgan";
import AuthService from "./api/auth/auth.service";
import Routes from "./routes";
import DatabaseService from "./services/database.service";

class App {
  public app: express.Application;

  private database = DatabaseService;

  constructor() {
    this.app = express();
    this.enableCors();

    this.app.use(morgan("dev"));
    this.app.use(this.enableCors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: false }));
    this.app.use(AuthService.validate);

    this.database.createConnection();

    Routes.config(this.app);
  }

  enableCors() {
    const options: cors.CorsOptions = {
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
        "Authorization",
      ],
      credentials: true,
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
      origin: "*",
      preflightContinue: false,
    };

    return cors(options);
  }

  closedataBaseConnection(message: string, callback: () => void) {
    this.database.closeConnection(message, () => callback());
  }
}

export default new App();
