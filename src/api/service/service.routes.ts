import ServiceController from "./service.controller";

class ServiceRoutes {
  public config(app): void {
    app
      .route("/api/v1/service")
      .get(ServiceController.get.bind(ServiceController));
    app
      .route("/api/v1/service")
      .post(ServiceController.create.bind(ServiceController));
    app
      .route("/api/v1/service/:id")
      .get(ServiceController.getById.bind(ServiceController));
    app
      .route("/api/v1/service/:id")
      .put(ServiceController.update.bind(ServiceController));
    app
      .route("/api/v1/service/:id")
      .delete(ServiceController.delete.bind(ServiceController));
  }
}

export default new ServiceRoutes();
