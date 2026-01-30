"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const superAdminMiddleware = (req, res, next) => {
    try {
        console.log(req.headers);
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "SUPER_ADMIN") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.superAdminId = decoded.adminId;
        console.log("SA", decoded);
        next();
    }
    catch (e) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
exports.superAdminMiddleware = superAdminMiddleware;
