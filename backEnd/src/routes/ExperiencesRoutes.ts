import { Router } from 'express';
import { ExperiencesController } from '../controllers/ExperiencesController.js';

const router = Router();

router.get('/experiences', ExperiencesController.getAll);
router.get('/experiences/:id', ExperiencesController.getById);
router.post('/experiences', ExperiencesController.create);
router.put('/experiences/:id', ExperiencesController.update);
router.delete('/experiences/:id', ExperiencesController.delete);

export default router;