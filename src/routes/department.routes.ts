import { Router } from "express";
import { superAdminMiddleware } from "../middleware/superAdminAuth.middleware";
import { createDepartment, editDepartment, deleteDepartment, getAllDepartments, editDepartmentStatus } from "../controllers/departmentController"
const router = Router();
router.post("/", superAdminMiddleware, createDepartment);
router.put("/:id", superAdminMiddleware, editDepartment);
router.delete("/:id", superAdminMiddleware, deleteDepartment);
router.get("/", superAdminMiddleware, getAllDepartments);
router.patch("/:id/status", superAdminMiddleware, editDepartmentStatus);
export default router;
