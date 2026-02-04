import { Router } from "express";
import {
    bulkUpsertMonthlyAttendance,
    getMonthlyAttendance,
    getWorkingDays
} from "../controllers/attendanceController";

const router = Router();

router.get("/", getMonthlyAttendance);
router.put("/bulk", bulkUpsertMonthlyAttendance);
router.get("/working-days", getWorkingDays);
export default router;
