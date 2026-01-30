import { Router } from "express";
import {
    addPayrollAdjustment,
    deletePayrollAdjustment,
} from "../controllers/payrollAdjustmentController";

const router = Router();

router.post("/", addPayrollAdjustment);
router.delete("/:id", deletePayrollAdjustment);

export default router;
