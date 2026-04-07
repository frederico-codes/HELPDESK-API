"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const app_error_1 = require("../utils/app-error");
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("../configs/auth");
function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new app_error_1.AppError("JWT token não informado", 401);
    }
    const [, token] = authHeader.split(" ");
    const { sub: user_id, role } = (0, jsonwebtoken_1.verify)(token, auth_1.authConfig.jwt.secret);
    request.user = {
        id: String(user_id),
        role,
    };
    return next();
}
