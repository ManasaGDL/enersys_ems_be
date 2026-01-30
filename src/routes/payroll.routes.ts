import { Router } from "express";
import { generatePayrollRun, getPayrollRun, updatePayrollRunStatus } from "../controllers/payrollController.ts";

const router = Router();

router.get("/run", getPayrollRun);
router.post("/run/generate", generatePayrollRun);
router.patch("/run/:id/status", updatePayrollRunStatus);
export default router;
