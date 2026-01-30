import { Router } from "express";
import {
    bulkUpsertMonthlyAttendance,
    getMonthlyAttendance,
} from "../controllers/attendanceController";

const router = Router();

router.get("/", getMonthlyAttendance);
router.put("/bulk", bulkUpsertMonthlyAttendance);

export default router;
