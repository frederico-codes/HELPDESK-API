import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";
import { UsersController } from "../controllers/users-controller";

const technicalsRoutes = Router();

const usersController = new UsersController();

technicalsRoutes.get(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["manager", "technical", "customer"]),
  usersController.listTechnicals
);

export { technicalsRoutes };