import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const superAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.headers)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            adminId: string;
            type: string;
        };
        if (decoded.type !== "SUPER_ADMIN") {
            return res.status(401).json({ message: "Unauthorized" })
        }
        req.superAdminId = decoded.adminId;
        console.log("SA", decoded)
        next();

    } catch (e) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}

