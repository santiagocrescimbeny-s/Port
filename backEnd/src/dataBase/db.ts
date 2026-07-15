import { Pool } from 'pg';

// Configuramos el Pool leyendo directamente las variables de entorno (process.env)
// Si no existen (por ejemplo, en desarrollo local básico), asume valores por defecto seguros.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'portfolio',
  
  // === AGREGA ESTA LÍNEA CLAVE AQUÍ ===
  // Si existe DB_HOST (estamos en AWS), activa SSL. Si no, desactívalo para local.
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,

  // Configuraciones de producción recomendadas para AWS:
  max: 10, // Máximo número de clientes simultáneos en el pool
  idleTimeoutMillis: 30000, // Tiempo para cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo límite para entablar una conexión
});

// Evento para monitorear que el pool se conectó correctamente
pool.on('connect', () => {
  console.log('🔌 Conexión establecida exitosamente con el Pool de PostgreSQL');
});

// Evento por si ocurre un error inesperado en un cliente inactivo
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
  process.exit(-1);
});

// Función helper para realizar consultas (queries) en cualquier parte del backend
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;