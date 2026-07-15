import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../dataBase/db.js'; // Tu pool de conexión Postgres

// Inicializamos el SDK con la API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AiService {
  
  static async handleChat(userQuery: string, sessionId: string): Promise<string> {
    try {
      // 1. Buscar información relevante en la base de datos (Knowledge Base)
      // Buscamos si la pregunta del usuario coincide con alguna de nuestras palabras clave (question_keyword)
      const queryText = `
        SELECT detailed_answer 
        FROM ai_knowledge_base 
        WHERE $1 ILIKE '%' || question_keyword || '%'
        LIMIT 3
      `;
      const dbResult = await pool.query(queryText, [userQuery]);
      
      // Juntamos los fragmentos de información que encontramos
      let personalContext = '';
      if (dbResult.rows.length > 0) {
        personalContext = dbResult.rows.map(row => row.detailed_answer).join('\n\n');
      } else {
        // Contexto por defecto si no encuentra palabras clave específicas
        personalContext = "Santiago es un desarrollador Full Stack con conocimientos en Node.js, Express, PostgreSQL, React y despliegues en AWS (ECS, RDS, Fargate). Actualmente está construyendo su portfolio.";
      }

      // 2. Definir las instrucciones del sistema (System Prompt)
      const systemInstruction = `
        Eres el asistente virtual interactivo del portfolio de Santiago Crescimbeni. 
        Tu objetivo es responder preguntas de reclutadores, desarrolladores o visitantes de forma profesional, amigable y concisa.
        
        Usa ÚNICAMENTE la siguiente información real sobre Santiago para responder:
        """
        ${personalContext}
        """

        Reglas estrictas:
        - Si te preguntan algo que NO está en la información provista, di amablemente que no tienes esa información y ofréceles contactar a Santiago mediante el formulario.
        - Sé profesional, entusiasta y mantén las respuestas relativamente cortas para que la experiencia de chat sea fluida.
      `;

      // 3. Llamar a la API de Gemini (Usando gemini-1.5-flash que es rápido y eficiente)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction 
      });

      const result = await model.generateContent(userQuery);
      const aiResponse = result.response.text();

      // 4. Guardar log en 'ai_search_logs' (Opcional, para monitoreo)
      try {
        await pool.query(
          `INSERT INTO ai_search_logs (session_id, query_text, detected_intent, tokens_used) 
           VALUES ($1, $2, $3, $4)`,
          [sessionId || 'anonimo', userQuery, 'general_chat', 0] 
        );
      } catch (logErr) {
        console.error('Error al guardar log de IA:', logErr);
      }

      return aiResponse;

    } catch (error) {
      console.error('Error en AiService.handleChat:', error);
      throw new Error('Error al procesar la consulta con la IA');
    }
  }
}