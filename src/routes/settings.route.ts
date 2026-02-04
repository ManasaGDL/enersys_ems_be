import { Router } from "express";
import { getAppSettings, updateAppSettings } from "../controllers/settings.controller";
import { getHolidaysByMonthYear, createHoliday, deleteHoliday, updateHoliday } from "../controllers/settingsHoliday.controller";

const router = Router();

// ✅ Get settings
router.get("/", getAppSettings);

// ✅ Update settings
router.put("/", updateAppSettings);

// ✅ Get holidays by month/year
router.get("/holidays", getHolidaysByMonthYear);

// ✅ Add holiday
router.post("/holidays", createHoliday);
router.put("/holidays/:id", updateHoliday)
// ✅ Delete holiday
router.delete("/holidays/:id", deleteHoliday);

export default router;
