import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const superAdminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const superAdminexists = await prisma.superAdmin.findUnique({
            where: { email }
        })
        if (!superAdminexists) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        if (superAdminexists.status !== "ACTIVE") {
            return res.status(403).json({
                message: "Super admin is inactive",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, superAdminexists.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign(
            {
                adminId: superAdminexists.id,
                type: "SUPER_ADMIN",
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "1d",
            }
        );
        return res.status(200).json({
            token,
        });
    } catch (e: any) {
        console.error("========== PRISMA ERROR START ==========");
        console.error(e);
        console.error("message:", e?.message);
        console.error("code:", e?.code);
        console.error("meta:", e?.meta);
        console.error("stack:", e?.stack);
        console.error("=========== PRISMA ERROR END ===========");
        return res.status(500).json({ message: "Internal server error" })
    }
}

