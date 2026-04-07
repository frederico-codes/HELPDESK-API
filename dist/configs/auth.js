"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
exports.authConfig = {
    jwt: {
        secret: process.env.AUTH_SECRET || "default",
        expiresIn: "1d",
    }
};
