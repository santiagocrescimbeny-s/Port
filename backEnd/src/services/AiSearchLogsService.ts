import { AiSearchLogsRepository } from '../repositories/AiSearchLogsRepository.js';
import type { AiSearchLogInput, AiSearchLog } from '../repositories/AiSearchLogsRepository.js';

export class AiSearchLogsService {
  
  // Registrar una búsqueda
  static async logSearch(data: AiSearchLogInput): Promise<AiSearchLog> {
    if (!data.sessionId || !data.queryText) {
      throw new Error('sessionId y queryText son requeridos para registrar el log.');
    }

    // Aquí podrías agregar lógica para auto-detectar intenciones básicas por palabra clave antes de guardar
    let intent = data.detectedIntent;
    if (!intent) {
      const lowerQuery = data.queryText.toLowerCase();
      if (lowerQuery.includes('estudi') || lowerQuery.includes('universi') || lowerQuery.includes('gradu')) {
        intent = 'education_info';
      } else if (lowerQuery.includes('proyect') || lowerQuery.includes('portfolio') || lowerQuery.includes('github')) {
        intent = 'projects_info';
      } else if (lowerQuery.includes('tecnologi') || lowerQuery.includes('stack') || lowerQuery.includes('sabe usar')) {
        intent = 'skills_info';
      } else {
        intent = 'general_chat';
      }
    }

    return await AiSearchLogsRepository.create({
      ...data,
      detectedIntent: intent
    });
  }

  // Obtener todo el historial de búsquedas de la IA
  static async getSearchHistory(): Promise<any[]> {
    return await AiSearchLogsRepository.getAll();
  }
}