"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.servicesRoutes = void 0;
const express_1 = require("express");
const services_controller_1 = require("../controllers/services-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const verify_user_authorization_1 = require("../middlewares/verify-user-authorization");
const servicesRoutes = (0, express_1.Router)();
exports.servicesRoutes = servicesRoutes;
const servicesController = new services_controller_1.ServicesController();
// criar serviço
servicesRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["manager"]), servicesController.create);
// listar serviços
servicesRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, servicesController.index);
// buscar um serviço por id
servicesRoutes.get("/:id", ensure_authenticated_1.ensureAuthenticated, servicesController.show);
// editar serviço
servicesRoutes.put("/:id", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["manager"]), servicesController.update);
// desativar serviço
servicesRoutes.patch("/:id/deactivate", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["manager"]), servicesController.deactivate);
// reativar serviço
servicesRoutes.patch("/:id/activate", ensure_authenticated_1.ensureAuthenticated, (0, verify_user_authorization_1.verifyUserAuthorization)(["manager"]), servicesController.activate);
