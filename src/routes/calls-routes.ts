import { Router } from "express";
import { CallController } from "@/controllers/calls-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const callsRoutes = Router()
const callController = new CallController()

callsRoutes.get("/", callController.index)
callsRoutes.post("/",ensureAuthenticated,verifyUserAuthorization(["customer","admin"]), callController.create)

export { callsRoutes }

