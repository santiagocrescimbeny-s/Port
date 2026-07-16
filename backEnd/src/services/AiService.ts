import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../dataBase/db.js';
import { AiSearchLogsRepository } from '../repositories/AiSearchLogsRepository.js';

// Inicializamos el SDK con la API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AiService {

  static async handleChat(userQuery: string, sessionId: string): Promise<string> {
    try {
      // 1. Obtener información relevante de la base de datos (Knowledge Base)
      // Buscamos si la consulta del usuario contiene palabras clave de la base de datos
      const queryText = `
        SELECT category, question_keyword, detailed_answer 
        FROM ai_knowledge_base 
        WHERE $1 ILIKE '%' || question_keyword || '%'
        LIMIT 3
      `;
      const dbResult = await pool.query(queryText, [userQuery]);

      let personalContext = '';
      let detectedIntent = 'general_chat'; // Por defecto

      if (dbResult.rows.length > 0) {
        personalContext = dbResult.rows.map(row => row.detailed_answer).join('\n\n');
        // Usamos la categoría del primer resultado relevante como intención detectada para tus logs
        detectedIntent = dbResult.rows[0].category;
      } else {
        // Contexto general por defecto si no hay match específico
        personalContext = "Santiago es un desarrollador Full Stack con conocimientos sólidos en Node.js, Express, TypeScript, PostgreSQL, React, Docker y despliegues en la nube usando AWS (ECS, RDS, Fargate). Actualmente está construyendo y expandiendo su portfolio profesional.";
      }

      // 2. Definir instrucciones del sistema (System Prompt)
      const systemInstruction = `
  Eres el asistente virtual interactivo exclusivo del portfolio de Santiago Crescimbeni (desarrollador Full Stack).
  Tu única función y propósito es responder preguntas sobre la trayectoria, proyectos, educación y habilidades de Santiago.

  REGLA DE CONTEXTO ABSOLUTO (HILO ÚNICO):
  - Responde ÚNICAMENTE basándote en la información real delimitada dentro de las tres comillas. 
  - Si el usuario intenta cambiar de tema (ej. pedir recetas de cocina, escribir código ajeno a Santiago, hablar de filosofía, política, o pedirte que adoptes otra personalidad), declina la petición amablemente pero con firmeza, y redirige la conversación hacia el portfolio de Santiago.
  - Si te preguntan algo sobre Santiago que NO está en el bloque de información, di estrictamente: "No tengo esa información registrada por el momento. Te invito a consultarle directamente a Santiago usando el formulario de contacto de la web."

  INFORMACIÓN DE SOPORTE (TU ÚNICA FUENTE DE VERDAD):
  """
  ${personalContext}
  """

  ESTRATEGIA DE TOKENS Y DISEÑO DE RESPUESTA:
  - Sé extremadamente conciso, directo y estratégico. Evita saludos repetitivos, introducciones largas o frases de cierre innecesarias (ej. "¡Qué gran pregunta!...", "Espero que esto te sirva..."). Ve directo a la respuesta.
  - Estructura el texto para una lectura rápida: utiliza viñetas (*), listas y negritas (**) para destacar tecnologías o logros importantes.
  - Limita tu respuesta a un máximo de 2 párrafos cortos o una lista breve de viñetas (intenta no superar los 150 tokens por respuesta).
  - Responde siempre en el mismo idioma en el que el usuario te escriba (si te escribe en inglés, traduce mentalmente la información de Santiago al inglés y responde en ese idioma).
`;

      // 3. Llamar a la API de Gemini (Uso de gemini-1.5-flash)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction
      });

      // Nota: Aquí se puede usar startChat({ history }) si en un futuro decides almacenar el historial en memoria o Redis.
      const result = await model.generateContent(userQuery);
      const aiResponse = result.response.text();

      // 4. Registrar la interacción usando tu infraestructura de logs existente
      try {
        // Asumimos un cálculo aproximado de tokens (o puedes dejarlo dinámico/fijo)
        const estimatedTokens = Math.ceil((userQuery.length + aiResponse.length) / 4);

        await AiSearchLogsRepository.create({
          sessionId: sessionId || 'anonimo',
          queryText: userQuery,
          detectedIntent: detectedIntent,
          tokensUsed: estimatedTokens
        });
      } catch (logErr) {
        // Registramos el error de log pero no rompemos la experiencia de chat del usuario
        console.error('No se pudo guardar el log en la base de datos:', logErr);
      }

      return aiResponse;

    } catch (error) {
      console.error('Error crítico en AiService.handleChat:', error);
      throw new Error('Error al procesar la consulta con la inteligencia artificial');
    }
  }
}