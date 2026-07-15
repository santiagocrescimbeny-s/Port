import { ProjectsRepository } from "../repositories/ProjectsRepository.js";
import type { Projects } from "../models/Projects.js";

export class ProjectsService {
    private projectsRepository: ProjectsRepository;

    constructor() {
        this.projectsRepository = new ProjectsRepository;
    }

    async getAllProjects(): Promise<Projects[]> {
        const projects = await this.projectsRepository.findAll();
        return projects;
    }
}