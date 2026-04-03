import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const uploadFolder = path.resolve("uploads");

export const multerConfig = {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(req, file, callback) {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const filename = `${fileHash}-${file.originalname}`;

      callback(null, filename);
    },
  }),
};