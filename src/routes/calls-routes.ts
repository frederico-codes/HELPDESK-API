import { Router } from "express";
import {
  createCall,
  listCalls,
  listCallById,
  updateCallStatus,
  addAdditionalService,
  removeAdditionalService,
} from "../controllers/calls-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";

const callsRoutes = Router();

callsRoutes.patch(
  "/:id/status",
  ensureAuthenticated,
  verifyUserAuthorization(["technical", "manager"]),
  updateCallStatus
);

// 🔥 PRIMEIRO a rota dinâmica
callsRoutes.get("/:id", ensureAuthenticated, listCallById);

// 🔥 DEPOIS a rota geral
callsRoutes.get("/", ensureAuthenticated, listCalls);

callsRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["customer", "manager"]),
  createCall
);

callsRoutes.post(
  "/:id/additional-services",
  ensureAuthenticated,
  verifyUserAuthorization(["technical", "manager"]),
  addAdditionalService
);

callsRoutes.delete(
  "/:id/additional-services/:additionalServiceId",
  ensureAuthenticated,
  verifyUserAuthorization(["technical", "manager"]),
  removeAdditionalService
);

export { callsRoutes };