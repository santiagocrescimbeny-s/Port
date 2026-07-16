import { Router } from 'express';
import { AiService } from '../services/AiService.js';

const router = Router();

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'El mensaje es obligatorio.' });
  }

  try {
    const response = await AiService.handleChat(message, sessionId);
    return res.json({ success: true, data: response });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;