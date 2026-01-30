"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const employeeMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== "EMPLOYEE") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.employeeId = decoded.employeeId;
        next();
    }
    catch (e) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
exports.employeeMiddleware = employeeMiddleware;
