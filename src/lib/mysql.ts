import * as mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hansco123',
  database: process.env.DB_NAME || 'school_information_system',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Connection pool for better performance
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  port: config.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function executeTransaction(queries: { query: string; params?: any[] }[]) {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Transaction error:', error);
    throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await executeQuery('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database test connection failed:', error);
    return false;
  }
}

export async function closePool() {
  await pool.end();
}

export default {
  getConnection,
  executeQuery,
  executeTransaction,
  testConnection,
  closePool
};