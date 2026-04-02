import { Router } from "express";
import {
  createCall,
  listCalls,
  listCallById,
  updateCallStatus,
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

export { callsRoutes };