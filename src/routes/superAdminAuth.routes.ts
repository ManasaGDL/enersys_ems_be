import { Router } from "express";
import { superAdminLogin } from "../controllers/superAdminAuthController";
const router = Router();
router.post("/login", superAdminLogin);
export default router;
