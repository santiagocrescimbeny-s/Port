// src/controllers/searchController.ts
import type { Request, Response } from 'express';
import { AiService } from '../services/IAService.js';

export const handleSearch = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  // 1. Configuramos cabeceras para streaming continuo hacia el frontend de Astro
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    console.log("Intentando conectar con Gemini...");
    
    // Llamamos al stream de Gemini
    const geminiStream = await AiService.askGeminiStream(prompt);

    // Consumimos el stream de Gemini fragmento por fragmento
    for await (const chunk of geminiStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    // Si Gemini terminó con éxito, cerramos la respuesta aquí
    return res.end();

  } catch (geminiError: any) {
    // 2. ¡ACTUACIÓN INMEDIATA! Si Gemini falla por cuota o error de servidor, entramos aquí
    console.warn("⚠️ Gemini falló o excedió su cuota. Cambiando a OpenAI de inmediato...");
    console.error("Detalle del error de Gemini:", geminiError.message || geminiError);

    try {
      // Llamamos inmediatamente al stream de OpenAI de respaldo
      const openAiStream = await AiService.askOpenAIStream(prompt);

      // Consumimos el stream de OpenAI (su estructura interna usa choices[0].delta)
      for await (const chunk of openAiStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content); // Seguimos escribiendo en el mismo canal abierto hacia el cliente
        }
      }
      
      // Si OpenAI resolvió con éxito, cerramos la respuesta
      return res.end();

    } catch (openAiError) {
      // 3. Plan de emergencia final si AMBAS plataformas están caídas
      console.error("❌ Ambas IA han fallado catastróficamente:", openAiError);
      res.status(503).write("Lo siento, en este momento todos mis servicios de inteligencia artificial se encuentran saturados. Por favor, intenta de nuevo más tarde.");
      return res.end();
    }
  }
};