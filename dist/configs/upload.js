"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const uploadFolder = node_path_1.default.resolve("uploads");
exports.multerConfig = {
    directory: uploadFolder,
    storage: multer_1.default.diskStorage({
        destination: uploadFolder,
        filename(req, file, callback) {
            const fileHash = node_crypto_1.default.randomBytes(10).toString("hex");
            const filename = `${fileHash}-${file.originalname}`;
            callback(null, filename);
        },
    }),
};
