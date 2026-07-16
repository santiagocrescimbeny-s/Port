import pool from '../dataBase/db.js';

export interface AiKnowledgeBaseInput {
  category: string;
  questionKeyword: string;
  detailedAnswer: string;
}

export interface AiKnowledgeBase {
  id: number;
  category: string;
  question_keyword: string;
  detailed_answer: string;
  updated_at: Date;
}

export class AiKnowledgeBaseRepository {
  
  // 1. Crear un nuevo registro de conocimiento
  static async create(data: AiKnowledgeBaseInput): Promise<AiKnowledgeBase> {
    const queryText = `
      INSERT INTO ai_knowledge_base (category, question_keyword, detailed_answer, updated_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, category, question_keyword, detailed_answer, updated_at
    `;
    const values = [data.category, data.questionKeyword, data.detailedAnswer];
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  // 2. Obtener toda la base de conocimiento (útil para tu panel de administrador)
  static async getAll(): Promise<AiKnowledgeBase[]> {
    const queryText = `
      SELECT id, category, question_keyword, detailed_answer, updated_at
      FROM ai_knowledge_base
      ORDER BY category ASC, question_keyword ASC
    `;
    const { rows } = await pool.query(queryText);
    return rows;
  }

  // 3. Obtener un registro específico por ID
  static async getById(id: number): Promise<AiKnowledgeBase | null> {
    const queryText = `
      SELECT id, category, question_keyword, detailed_answer, updated_at
      FROM ai_knowledge_base
      WHERE id = $1
    `;
    const { rows } = await pool.query(queryText, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // 4. Actualizar un registro de conocimiento
  static async update(id: number, data: Partial<AiKnowledgeBaseInput>): Promise<AiKnowledgeBase | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    if (data.category !== undefined) {
      fields.push(`category = $${queryIndex++}`);
      values.push(data.category);
    }
    if (data.questionKeyword !== undefined) {
      fields.push(`question_keyword = $${queryIndex++}`);
      values.push(data.questionKeyword);
    }
    if (data.detailedAnswer !== undefined) {
      fields.push(`detailed_answer = $${queryIndex++}`);
      values.push(data.detailedAnswer);
    }

    if (fields.length === 0) return null;

    // Añadimos la actualización de fecha de modificación de forma automática
    fields.push(`updated_at = NOW()`);

    const queryText = `
      UPDATE ai_knowledge_base
      SET ${fields.join(', ')}
      WHERE id = $${queryIndex}
      RETURNING id, category, question_keyword, detailed_answer, updated_at
    `;
    values.push(id);

    const { rows } = await pool.query(queryText, values);
    return rows.length > 0 ? rows[0] : null;
  }

  // 5. Eliminar un registro de conocimiento
  static async delete(id: number): Promise<boolean> {
    const queryText = `
      DELETE FROM ai_knowledge_base
      WHERE id = $1
    `;
    const result = await pool.query(queryText, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}