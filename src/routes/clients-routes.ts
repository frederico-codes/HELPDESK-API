import { Router } from "express";
import { ClientsController } from "../controllers/clients-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const clientsRoutes = Router();
const clientController = new ClientsController();

clientsRoutes.post("/", clientController.create);
clientsRoutes.get("/", clientController.index);
clientsRoutes.get("/:id", clientController.show);
clientsRoutes.put("/:id", ensureAuthenticated, clientController.update);
clientsRoutes.delete("/:id", ensureAuthenticated, clientController.delete);

export { clientsRoutes };