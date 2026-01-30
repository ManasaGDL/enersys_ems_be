import { Router } from "express";
import { superAdminMiddleware } from "../middleware/superAdminAuth.middleware";
import { createRole, editRole, deleteRole, getAllRoles, editRoleStatus } from "../controllers/rolesController"
const router = Router();
router.post("/", superAdminMiddleware, createRole);
router.put("/:id", superAdminMiddleware, editRole);
router.delete("/:id", superAdminMiddleware, deleteRole);
router.get("/", superAdminMiddleware, getAllRoles);
router.patch("/:id/status", superAdminMiddleware, editRoleStatus);
export default router;
