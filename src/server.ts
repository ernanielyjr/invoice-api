import App from "./app";
import AppConfig from "./configs/app.config";

const port = process.env.PORT || "8080";

App.app.listen(port, () => console.log(`server running in ${port}`, AppConfig));

process.once("SIGUSR2", () =>
  App.closedataBaseConnection("nodemon restart", () =>
    process.kill(process.pid, "SIGUSR2")
  )
);
process.once("SIGINT", () =>
  App.closedataBaseConnection("connection crashed", () => process.exit(0))
);
