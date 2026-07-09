import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export const getDbPool = (): mysql.Pool => {
  if (!pool) {
    console.log('[DB] Creating a new MySQL connection pool in Vercel Serverless context...');
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE || 'nexus_ai_db',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
};

export const db = {
  query: async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
    const dbPool = getDbPool();
    const [rows] = await dbPool.query(sql, params);
    return rows as T[];
  },
  execute: async (sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: string | number }> => {
    const dbPool = getDbPool();
    const [result] = await dbPool.execute(sql, params);
    const res = result as any;
    return {
      affectedRows: res.affectedRows || 0,
      insertId: res.insertId
    };
  }
};
