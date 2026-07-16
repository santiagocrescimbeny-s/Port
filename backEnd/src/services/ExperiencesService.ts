import { ExperiencesRepository } from '../repositories/ExperiencesRepository.js';
import type { ExperienceInput, Experience } from '../repositories/ExperiencesRepository.js';

export class ExperiencesService {

  static async getAllExperiences(): Promise<Experience[]> {
    return await ExperiencesRepository.getAll();
  }

  static async getExperienceById(id: number): Promise<Experience> {
    const experience = await ExperiencesRepository.getById(id);
    if (!experience) {
      throw new Error(`No se encontró ninguna experiencia con ID ${id}`);
    }
    return experience;
  }

  static async createExperience(data: ExperienceInput): Promise<Experience> {
    if (!data.companyInstitution || !data.roleTitle || !data.startDate || data.locationId === undefined) {
      throw new Error('companyInstitution, roleTitle, startDate y locationId son obligatorios.');
    }

    // Aseguramos que achievements sea un arreglo limpio
    const cleanAchievements = Array.isArray(data.achievements) 
      ? data.achievements.map(a => a.trim()).filter(Boolean)
      : [];

    return await ExperiencesRepository.create({
      ...data,
      achievements: cleanAchievements
    });
  }

  static async updateExperience(id: number, data: Partial<ExperienceInput>): Promise<Experience> {
    if (data.achievements) {
      data.achievements = Array.isArray(data.achievements)
        ? data.achievements.map(a => a.trim()).filter(Boolean)
        : [];
    }

    const updated = await ExperiencesRepository.update(id, data);
    if (!updated) {
      throw new Error(`No se pudo actualizar la experiencia, el ID ${id} no existe`);
    }
    return updated;
  }

  static async deleteExperience(id: number): Promise<void> {
    const deleted = await ExperiencesRepository.delete(id);
    if (!deleted) {
      throw new Error(`No se pudo eliminar la experiencia, el ID ${id} no existe`);
    }
  }
}