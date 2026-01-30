import "express";

declare global {
    namespace Express {
        interface Request {
            employeeId?: string;
            superAdminId?: string;
        }
    }
}
