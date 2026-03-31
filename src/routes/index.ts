import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { callsRoutes } from "./calls-routes";
import { sessionsRoutes } from "./session-routes";
import { servicesRoutes } from "./services-routes";
import { technicalsRoutes } from "./technicals-routes";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/calls", callsRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/services", servicesRoutes);
routes.use("/technicals", technicalsRoutes);

export { routes };