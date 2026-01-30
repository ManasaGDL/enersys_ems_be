"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payrollController_1 = require("../controllers/payrollController");
const router = (0, express_1.Router)();
router.get("/run", payrollController_1.getPayrollRun);
router.post("/run/generate", payrollController_1.generatePayrollRun);
router.patch("/run/:id/status", payrollController_1.updatePayrollRunStatus);
exports.default = router;
