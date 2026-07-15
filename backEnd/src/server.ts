import express, { type Request, type Response } from 'express';
import { query } from './dataBase/db.js'; 
import projectsRoutes from './routes/ProjectsRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. Conectamos la ruta con el prefijo global
app.use('/api/projects', projectsRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('¡Servidor Express con TypeScript funcionando!');
});

// 🚀 Nueva Ruta de Prueba de Base de Datos
app.get('/db-check', async (req: Request, res: Response) => {
  try {
    // Hacemos una consulta nativa a PostgreSQL para obtener la hora actual del servidor de AWS
    const result = await query('SELECT NOW();');
    res.json({
      status: 'Conectado exitosamente a AWS RDS',
      timestamp: result.rows[0].now
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ 
      status: 'Error al conectar con la base de datos', 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});