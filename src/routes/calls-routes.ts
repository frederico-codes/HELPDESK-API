import { Router } from "express";
import { CallsController } from "../controllers/calls-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";

const callsRoutes = Router();
const callsController = new CallsController();

callsRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["customer", "manager"]),
  callsController.createCall
);

callsRoutes.post(
  "/:id/additional-services",
  ensureAuthenticated,
  verifyUserAuthorization(["technical", "manager"]),callsController.
  addAdditionalService
);

callsRoutes.get("/", ensureAuthenticated, callsController.listCalls);

callsRoutes.get("/:id", ensureAuthenticated, callsController.listCallById);

callsRoutes.patch(
  "/:id/status",
  ensureAuthenticated,
  verifyUserAuthorization(["technical", "manager"]),callsController.
  updateCallStatus
);


callsRoutes.delete(
  "/:id/additional-services/:additionalServiceId",
  ensureAuthenticated,
  verifyUserAuthorization(["technical", "manager"]), callsController.
  removeAdditionalService
);

export { callsRoutes };