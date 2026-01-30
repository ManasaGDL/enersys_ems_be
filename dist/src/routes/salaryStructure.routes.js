"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const salaryStructure_1 = require("../controllers/salaryStructure");
const router = (0, express_1.Router)();
// ✅ Get all employees + salary structures
router.get("/", salaryStructure_1.getAllSalaryStructures);
// ✅ Bulk save salary structures
router.put("/bulk", salaryStructure_1.bulkUpsertSalaryStructures);
exports.default = router;
