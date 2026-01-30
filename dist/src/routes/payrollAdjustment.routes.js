"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payrollAdjustmentController_1 = require("../controllers/payrollAdjustmentController");
const router = (0, express_1.Router)();
router.post("/", payrollAdjustmentController_1.addPayrollAdjustment);
router.delete("/:id", payrollAdjustmentController_1.deletePayrollAdjustment);
exports.default = router;
