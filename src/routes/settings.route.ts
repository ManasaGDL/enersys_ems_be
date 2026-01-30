import { Router } from "express";
import { getAppSettings, updateAppSettings } from "../controllers/settings.controller";

const router = Router();

// ✅ Get settings
router.get("/", getAppSettings);

// ✅ Update settings
router.put("/", updateAppSettings);

export default router;
