import { Pool } from 'pg';

// 1. Detectamos el entorno de base de datos.
// Si existe DATABASE_URL (en producción), se conecta usando el string de conexión único.
// Si no existe, recurre a las variables individuales para desarrollo local.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Requerido para la conexión segura con AWS RDS
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'portfolio_local',
      // Si por alguna razón usas SSL en local, se activará según el NODE_ENV
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

// 2. Instanciamos el Pool aplicando configuraciones recomendadas para producción en AWS Fargate
const pool = new Pool({
  ...poolConfig,
  max: 10, // Máximo número de clientes simultáneos en el pool
  idleTimeoutMillis: 30000, // Tiempo para cerrar conexiones inactivas
  connectionTimeoutMillis: 5000, // Tiempo límite (5s) para entablar una conexión antes de dar timeout
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