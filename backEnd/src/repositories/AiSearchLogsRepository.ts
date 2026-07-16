import pool from '../dataBase/db.js';

export interface AiSearchLogInput {
  sessionId: string;
  queryText: string;
  detectedIntent?: string;
  tokensUsed?: number;
}

export interface AiSearchLog {
  id: number;
  session_id: string;
  query_text: string;
  detected_intent: string;
  tokens_used: number;
  created_at: Date;
}

export class AiSearchLogsRepository {
  
  // 1. Guardar un nuevo log de búsqueda de la IA
  static async create(log: AiSearchLogInput): Promise<AiSearchLog> {
    const queryText = `
      INSERT INTO ai_search_logs (session_id, query_text, detected_intent, tokens_used)
      VALUES ($1, $2, $3, $4)
      RETURNING id, session_id, query_text, detected_intent, tokens_used, created_at
    `;
    const values = [
      log.sessionId,
      log.queryText,
      log.detectedIntent || 'general',
      log.tokensUsed || 0
    ];

    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  // 2. Traer todos los logs (para tu futuro panel de administrador)
  // Incluye un JOIN opcional con visitor_sessions si quieres ver de qué país/ciudad nos visitaron
 static async getAll(): Promise<any[]> {
    const queryText = `
      SELECT 
        l.id,
        l.session_id,
        l.query_text,
        l.detected_intent,
        l.tokens_used,
        l.created_at,
        v.ip_address,
        v.country,
        v.city,
        v.company_name
      FROM ai_search_logs l
      LEFT JOIN visitor_sessions v ON l.session_id = v.id
      ORDER BY l.created_at DESC
    `;
    const { rows } = await pool.query(queryText);
    return rows;
  }
}