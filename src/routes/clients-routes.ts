import { Router } from "express";
import { ClientsController } from "../controllers/clients-controller";

const clientsRoutes = Router();
const clientsController = new ClientsController();

clientsRoutes.post("/", clientsController.create);
clientsRoutes.get("/", clientsController.index);
clientsRoutes.get("/:id", clientsController.show);
clientsRoutes.put("/:id", clientsController.update);
clientsRoutes.delete("/:id", clientsController.delete);

export { clientsRoutes };