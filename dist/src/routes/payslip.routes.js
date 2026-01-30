"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payslipController_1 = require("../controllers/payslipController");
const router = (0, express_1.Router)();
router.get("/:payrollItemId", payslipController_1.getPayslipByPayrollItemId);
exports.default = router;
