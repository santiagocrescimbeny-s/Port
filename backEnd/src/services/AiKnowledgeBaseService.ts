import { AiKnowledgeBaseRepository } from '../repositories/AiKnowledgeBaseRepository.js';
import type { AiKnowledgeBaseInput, AiKnowledgeBase } from '../repositories/AiKnowledgeBaseRepository.js';

export class AiKnowledgeBaseService {
  
  // Lista de categorías válidas permitidas en el sistema
  private static readonly VALID_CATEGORIES = ['skills', 'education', 'experience', 'projects', 'general', 'contact'];

  static async createKnowledge(data: AiKnowledgeBaseInput): Promise<AiKnowledgeBase> {
    if (!data.category || !data.questionKeyword || !data.detailedAnswer) {
      throw new Error('category, questionKeyword y detailedAnswer son obligatorios.');
    }

    const cleanCategory = data.category.toLowerCase().trim();
    if (!this.VALID_CATEGORIES.includes(cleanCategory)) {
      throw new Error(`La categoría debe ser una de las siguientes: ${this.VALID_CATEGORIES.join(', ')}`);
    }

    return await AiKnowledgeBaseRepository.create({
      ...data,
      category: cleanCategory
    });
  }

  static async getAllKnowledge(): Promise<AiKnowledgeBase[]> {
    return await AiKnowledgeBaseRepository.getAll();
  }

  static async getKnowledgeById(id: number): Promise<AiKnowledgeBase> {
    const record = await AiKnowledgeBaseRepository.getById(id);
    if (!record) {
      throw new Error(`No se encontró ningún registro de conocimiento con ID ${id}`);
    }
    return record;
  }

  static async updateKnowledge(id: number, data: Partial<AiKnowledgeBaseInput>): Promise<AiKnowledgeBase> {
    if (data.category) {
      const cleanCategory = data.category.toLowerCase().trim();
      if (!this.VALID_CATEGORIES.includes(cleanCategory)) {
        throw new Error(`La categoría debe ser una de las siguientes: ${this.VALID_CATEGORIES.join(', ')}`);
      }
      data.category = cleanCategory;
    }

    const updatedRecord = await AiKnowledgeBaseRepository.update(id, data);
    if (!updatedRecord) {
      throw new Error(`No se pudo actualizar, el registro con ID ${id} no existe`);
    }
    return updatedRecord;
  }

  static async deleteKnowledge(id: number): Promise<void> {
    const success = await AiKnowledgeBaseRepository.delete(id);
    if (!success) {
      throw new Error(`No se pudo eliminar, el registro con ID ${id} no existe`);
    }
  }
}