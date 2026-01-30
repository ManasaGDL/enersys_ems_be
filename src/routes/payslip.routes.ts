import { Router } from "express";
import { getPayslipByPayrollItemId } from "../controllers/payslipController";

const router = Router();

router.get("/:payrollItemId", getPayslipByPayrollItemId);

export default router;
