// src/routes/SearchRoutes.ts
import { Router } from 'express';
import { handleSearch } from '../controllers/SearchController.js';
const router = Router();
// Definimos la ruta POST para las búsquedas
router.post('/search', handleSearch);
export default router;
//# sourceMappingURL=SearchRoutes.js.map