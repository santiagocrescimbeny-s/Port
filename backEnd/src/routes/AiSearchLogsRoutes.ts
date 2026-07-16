import { Router, type Request, type Response } from 'express';
import { AiSearchLogsService } from '../services/AiSearchLogsService.js';

const router = Router();

// Endpoint para traer el historial completo (Útil para tu Dashboard)
// GET /api/ai/logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const logs = await AiSearchLogsService.getSearchHistory();
    return res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para registrar un log manualmente (por si el Frontend necesita trackear algo específico)
// POST /api/ai/logs
router.post('/logs', async (req: Request, res: Response) => {
  const { sessionId, queryText, detectedIntent, tokensUsed } = req.body;

  try {
    const newLog = await AiSearchLogsService.logSearch({
      sessionId,
      queryText,
      detectedIntent,
      tokensUsed
    });
    return res.status(201).json({ success: true, data: newLog });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;