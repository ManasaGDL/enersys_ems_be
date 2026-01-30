import { Router } from "express";
import { syncProjectEmployees, getProjectEmployees } from "../controllers/projectAssignmentController";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controllers/projectController";

const router = Router();

router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.put("/:projectId/assign-employees", syncProjectEmployees);
router.get("/:projectId/employees", getProjectEmployees);
export default router;
