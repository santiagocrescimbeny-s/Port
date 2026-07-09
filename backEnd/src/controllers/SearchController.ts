import type { Request, Response } from 'express';
import { SearchService } from '../services/searchService/SearchService.js';

export const handleSearch = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt requerido" });
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    console.log(`🔍 Buscando en vectores: "${prompt}"`);
    
    // Buscar en la base de conocimiento local
    const results = await SearchService.searchKnowledge(prompt, 5);
    
    if (results.length === 0) {
      return res.json({
        success: true,
        results: [],
        message: "No se encontraron resultados."
      });
    }

    return res.json({
      success: true,
      query: prompt,
      results: results.map(r => ({
        content: r.content,
        metadata: r.metadata
      }))
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};