import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let pool: mysql.Pool | null = null;
let isConnected = false;

/**
 * Initializes and returns the MySQL connection pool.
 * Uses lazy loading to prevent crashes during startup when DB is not yet configured.
 */
export function getDbPool(): mysql.Pool {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;

  if (!host || !user) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      "[WARNING] Les variables d'environnement de la base de données MySQL ne sont pas configurées (MYSQL_HOST, MYSQL_USER)."
    );
    console.warn(
      "\x1b[33m%s\x1b[0m",
      "[WARNING] Le serveur va fonctionner en mode SIMULATION avec des données de secours."
    );
    throw new Error('MySQL connection variables missing');
  }

  try {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });

    // Test connection asynchronously
    pool.getConnection()
      .then((conn) => {
        console.log("\x1b[32m%s\x1b[0m", `[SUCCESS] Connecté avec succès à la base de données MySQL sur ${host}:${port}`);
        isConnected = true;
        conn.release();
      })
      .catch((err) => {
        console.error("\x1b[31m%s\x1b[0m", `[ERROR] Échec de connexion physique à MySQL sur ${host}:${port}`);
        console.error(err.message);
        isConnected = false;
      });

    return pool;
  } catch (error: any) {
    console.error("[ERROR] Erreur lors de l'initialisation du pool MySQL :", error.message);
    throw error;
  }
}

/**
 * Helper utility to execute queries safely.
 * Returns a fallback value or throws error.
 */
export async function executeQuery<T>(sql: string, params: any[] = []): Promise<T> {
  try {
    const dbPool = getDbPool();
    const [results] = await dbPool.execute(sql, params);
    return results as T;
  } catch (error: any) {
    console.error(`[DB ERROR] Erreur lors de l'exécution de la requête SQL: ${sql}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Checks if the database is currently connected successfully.
 */
export function isDbConnected(): boolean {
  return pool !== null && isConnected;
}
