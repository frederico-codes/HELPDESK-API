"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callsRoutes = void 0;
const express_1 = require("express");
const calls_controller_1 = require("../controllers/calls-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const verify_user_authorization_1 = require("../middlewares/verify-user-authorization");
const callsRoutes = (0, express_1.Router)();
exports.callsRoutes = callsRoutes;
callsRoutes.patch("/:id/status", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["technical", "manager"]), calls_controller_1.updateCallStatus);
// 🔥 PRIMEIRO a rota dinâmica
callsRoutes.get("/:id", ensure_authenticated_1.ensureAuthenticated, calls_controller_1.listCallById);
// 🔥 DEPOIS a rota geral
callsRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, calls_controller_1.listCalls);
callsRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["customer", "manager"]), calls_controller_1.createCall);
callsRoutes.post("/:id/additional-services", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["technical", "manager"]), calls_controller_1.addAdditionalService);
callsRoutes.delete("/:id/additional-services/:additionalServiceId", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["technical", "manager"]), calls_controller_1.removeAdditionalService);
