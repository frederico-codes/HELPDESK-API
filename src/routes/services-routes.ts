import { Router } from "express";
import { ServicesController } from "../controllers/services-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";

const servicesRoutes = Router();

const servicesController = new ServicesController();

// criar serviço
servicesRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["manager"]),
  servicesController.create
);

// listar serviços
servicesRoutes.get(
  "/",
  ensureAuthenticated,
  servicesController.index
);

// buscar um serviço por id
servicesRoutes.get(
  "/:id",
  ensureAuthenticated,
  servicesController.show
);

// editar serviço
servicesRoutes.put(
  "/:id",
  ensureAuthenticated,
  verifyUserAuthorization(["manager"]),
  servicesController.update
);

// desativar serviço
servicesRoutes.patch(
  "/:id/deactivate",
  ensureAuthenticated,
  verifyUserAuthorization(["manager"]),
  servicesController.deactivate
);

export { servicesRoutes };