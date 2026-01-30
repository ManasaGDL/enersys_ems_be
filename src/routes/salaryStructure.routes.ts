import { Router } from "express";
import {
    bulkUpsertSalaryStructures,
    getAllSalaryStructures,
} from "../controllers/salaryStructure";

const router = Router();

// ✅ Get all employees + salary structures
router.get("/", getAllSalaryStructures);

// ✅ Bulk save salary structures
router.put("/bulk", bulkUpsertSalaryStructures);

export default router;
