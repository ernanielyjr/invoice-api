import mongoose from "mongoose";
import AppConfig from "../configs/app.config";

class DatabaseService {
  private dbConnection;

  createConnection() {
    (<any>mongoose).Promise = global.Promise;
    mongoose.connect(AppConfig.database.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.logger();
  }

  logger() {
    this.dbConnection = mongoose.connection;
    this.dbConnection.on("connected", () =>
      console.log(`Mongose is connected in ${AppConfig.database.url}`)
    );
    this.dbConnection.on("error", (error) =>
      console.error("Connection Error:", error)
    );
    this.dbConnection.on("disconnected", () =>
      console.log(`Mongose is disconnected in ${AppConfig.database.url}`)
    );
  }

  closeConnection(message, callback) {
    this.dbConnection.close(() => {
      console.log(`Mongoose was desconeted by: ${message}`);
      callback();
    });
  }
}

export default new DatabaseService();
