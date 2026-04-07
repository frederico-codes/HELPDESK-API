"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const error_handing_1 = require("./middlewares/error-handing");
const routes_1 = require("./routes");
const cors_1 = __importDefault(require("cors"));
const node_path_1 = __importDefault(require("node:path"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(routes_1.routes);
app.use(error_handing_1.errorHandling);
app.use("/uploads", express_1.default.static(node_path_1.default.resolve("uploads")));
