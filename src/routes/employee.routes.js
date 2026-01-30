import { createEmployee, getEmployees, updateEmployee, deleteEmployee, updateEmployeePassword, toggleEmployeeStatus, getEmployeeById } from "../controllers/employeeController";
import { employeeMiddleware } from "../middleware/employeeAuth.middleware";
import { superAdminMiddleware } from "../middleware/superAdminAuth.middleware";

import { Router } from "express";

const router = Router();

router.post("/", superAdminMiddleware, createEmployee);
router.get("/", superAdminMiddleware, getEmployees);
router.put("/:id", superAdminMiddleware, updateEmployee);
router.delete("/:id", superAdminMiddleware, deleteEmployee);
router.patch("/:id/status", superAdminMiddleware, toggleEmployeeStatus);
router.get("/:id", superAdminMiddleware, getEmployeeById);
router.put("/:id/password", superAdminMiddleware, updateEmployeePassword)

export default router;