import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/SearchRoutes.js';
import { SearchService } from './services/searchService/SearchService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', searchRoutes);

// Inicia el servidor y precarga el modelo
app.listen(PORT, async () => {
  console.log(`🚀 Microservicio ejecutándose con éxito en http://localhost:${PORT}`);
  
  // Precarga el modelo en background
  await SearchService.preloadModel();
});