import { type Request, type Response } from 'express';
import { ExperiencesService } from '../services/ExperiencesService.js';

export class ExperiencesController {

  // GET /api/experiences
  static async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const experiences = await ExperiencesService.getAllExperiences();
      return res.status(200).json({ success: true, data: experiences });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/experiences/:id
  static async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID inválido' });
      }
      const experience = await ExperiencesService.getExperienceById(id);
      return res.status(200).json({ success: true, data: experience });
    } catch (error: any) {
      return res.status(404).json({ success: false, error: error.message });
    }
  }

  // POST /api/experiences
  static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        companyInstitution, 
        roleTitle, 
        description, 
        achievements, 
        startDate, 
        endDate, 
        isEducation, 
        locationId 
      } = req.body;

      const newExperience = await ExperiencesService.createExperience({
        companyInstitution,
        roleTitle,
        description,
        achievements,
        startDate,
        endDate,
        isEducation,
        locationId
      });

      return res.status(201).json({ success: true, data: newExperience });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // PUT /api/experiences/:id
  static async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID inválido' });
      }

      const updated = await ExperiencesService.updateExperience(id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/experiences/:id
  static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID inválido' });
      }

      await ExperiencesService.deleteExperience(id);
      return res.status(200).json({ success: true, message: 'Experiencia eliminada exitosamente' });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}