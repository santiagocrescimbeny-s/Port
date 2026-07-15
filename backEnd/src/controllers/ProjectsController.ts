import type { Request, Response } from "express";
import { ProjectsService } from "../services/ProjectsService.js";

export class ProjectsController {
    private projectsService: ProjectsService;

    constructor() {
        this.projectsService = new ProjectsService();
    }

    getAllProjects = async (req: Request, res: Response): Promise<void> => {
        try {
            const projects = await this.projectsService.getAllProjects();
            res.status(200).json(projects);
        } catch (error) {
            console.error("Error en ProjectsController.getAllProjects:", error);
            res.status(500).json({ message: "Error interno del servidor al obtener los proyectos" });
        }
    };
}