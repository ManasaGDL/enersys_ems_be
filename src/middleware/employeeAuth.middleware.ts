import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const employeeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            employeeId: string;
            type: string;
        };
        if (decoded.type !== "EMPLOYEE") {
            return res.status(401).json({ message: "Unauthorized" })
        }
        req.employeeId = decoded.employeeId;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}