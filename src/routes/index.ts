import { Router } from "express";
import { usersRoutes } from "./users-routes.js";
import { callsRoutes } from "./calls-routes.js";
import { sessionsRoutes } from "./session-routes.js";

const routes = Router();


routes.use("/users", usersRoutes)
routes.use("/call", callsRoutes);
routes.use("/sessions", sessionsRoutes);

export { routes };
