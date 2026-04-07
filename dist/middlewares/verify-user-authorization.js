"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserAuthorization = verifyUserAuthorization;
const app_error_1 = require("../utils/app-error");
function verifyUserAuthorization(role) {
    return (request, response, next) => {
        if (!request.user || !role.includes(request.user.role)) {
            throw new app_error_1.AppError("Unauthorization", 401);
        }
        return next();
    };
}
