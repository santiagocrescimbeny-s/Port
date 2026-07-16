import { Router, type Request, type Response } from 'express';
import { AiKnowledgeBaseService } from '../services/AiKnowledgeBaseService.js';

const router = Router();

// GET /api/ai/knowledge
// Listar todo el conocimiento disponible
router.get('/knowledge', async (req: Request, res: Response) => {
  try {
    const knowledge = await AiKnowledgeBaseService.getAllKnowledge();
    return res.status(200).json({ success: true, data: knowledge });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ai/knowledge/:id
// Obtener un registro en específico
router.get('/knowledge/:id', async (req: Request, res: Response) => {
  try {
const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }
    const record = await AiKnowledgeBaseService.getKnowledgeById(id);
    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    return res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/ai/knowledge
// Crear un nuevo registro
router.post('/knowledge', async (req: Request, res: Response) => {
  try {
    const { category, questionKeyword, detailedAnswer } = req.body;
    const newRecord = await AiKnowledgeBaseService.createKnowledge({
      category,
      questionKeyword,
      detailedAnswer
    });
    return res.status(201).json({ success: true, data: newRecord });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/ai/knowledge/:id
// Actualizar un registro existente
router.put('/knowledge/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }
    const updatedRecord = await AiKnowledgeBaseService.updateKnowledge(id, req.body);
    return res.status(200).json({ success: true, data: updatedRecord });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/ai/knowledge/:id
// Eliminar un registro
router.delete('/knowledge/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }
    await AiKnowledgeBaseService.deleteKnowledge(id);
    return res.status(200).json({ success: true, message: 'Registro de conocimiento eliminado exitosamente' });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;