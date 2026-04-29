import { Router } from "express";
import { UsersController } from "../controllers/users-controller"
import multer from "multer";
import { multerConfig } from "../configs/upload";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "../middlewares/verify-user-authorization";


const usersRoutes = Router();
const usersController = new UsersController();
const upload = multer(multerConfig);

usersRoutes.post("/", usersController.create);
usersRoutes.get(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["manager"]),
  usersController.index
);
usersRoutes.get("/:id", ensureAuthenticated, usersController.show);
usersRoutes.put("/:id", ensureAuthenticated, usersController.update);
usersRoutes.delete("/:id", ensureAuthenticated, usersController.delete);
usersRoutes.patch(
  "/:id/avatar",
  ensureAuthenticated,
  upload.single("avatar"),
  usersController.updateAvatar
);
usersRoutes.patch(
  "/:id/password",
  ensureAuthenticated,
  usersController.updatePassword
);

export { usersRoutes };