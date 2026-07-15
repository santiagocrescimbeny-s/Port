import { Router } from "express";
import { ProjectsController } from "../controllers/ProjectsController.js";

const router = Router();
const projectsController = new ProjectsController();

router.get("/", projectsController.getAllProjects);

export default router;