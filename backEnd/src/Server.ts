// src/Server.ts
import 'dotenv/config'; // <-- CAMBIO CRÍTICO: Carga las variables antes de los demás imports
import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/SearchRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', searchRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Microservicio ejecutándose con éxito en http://localhost:${PORT}`);
});