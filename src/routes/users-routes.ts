import { Router } from "express";
import { UsersController } from "@/controllers/users-controller";
import multer from "multer";
import { multerConfig } from "../configs/upload";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const usersRoutes = Router();
const usersController = new UsersController();
const upload = multer(multerConfig);

usersRoutes.post("/", usersController.create);
usersRoutes.get("/", usersController.index);
usersRoutes.get("/:id", usersController.show);
usersRoutes.put("/:id", usersController.update);
usersRoutes.delete("/:id", usersController.delete);
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