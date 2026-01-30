"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminLogin = void 0;
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const superAdminexists = await prisma_1.prisma.superAdmin.findUnique({
            where: { email }
        });
        if (!superAdminexists) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (superAdminexists.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Super admin is inactive",
            });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, superAdminexists.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            adminId: superAdminexists.id,
            type: "SUPER_ADMIN",
        }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.status(200).json({
            token,
        });
    }
    catch (e) {
        console.error("========== PRISMA ERROR START ==========");
        console.error(e);
        console.error("message:", e?.message);
        console.error("code:", e?.code);
        console.error("meta:", e?.meta);
        console.error("stack:", e?.stack);
        console.error("=========== PRISMA ERROR END ===========");
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.superAdminLogin = superAdminLogin;
