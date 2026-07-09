import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';

interface DbProvider {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: string | number }>;
  initialize(): Promise<void>;
}

class MySqlProvider implements DbProvider {
  private pool!: mysql.Pool;

  async initialize() {
    console.log('[DB] Initializing MySQL pool...');
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nexus_ai_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const conn = await this.pool.getConnection();
    console.log('[DB] Successfully connected to MySQL server.');
    conn.release();
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T[];
  }

  async execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: string | number }> {
    const [result] = await this.pool.execute(sql, params);
    const res = result as any;
    return {
      affectedRows: res.affectedRows || 0,
      insertId: res.insertId
    };
  }
}

class SqliteProvider implements DbProvider {
  private db!: Database;

  async initialize() {
    console.log('[DB] Initializing SQLite database...');
    const dbPath = path.resolve(__dirname, '../../nexus_ai.db');
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`[DB] SQLite database file: ${dbPath}`);

    // Create tables if they do not exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otps (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        trigger_type TEXT NOT NULL,
        nodes TEXT NOT NULL,
        edges TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        key_prefix TEXT NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        scopes TEXT DEFAULT 'read,write',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'INFO',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    
    console.log('[DB] SQLite tables initialized successfully.');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    // Replace MySQL parameter marker if different, but both use '?'
    return this.db.all<T[]>(sql, params);
  }

  async execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; insertId?: string | number }> {
    const result = await this.db.run(sql, params);
    return {
      affectedRows: result.changes || 0,
      insertId: result.lastID
    };
  }
}

let activeProvider: DbProvider;

if (dbType === 'mysql') {
  activeProvider = new MySqlProvider();
} else {
  activeProvider = new SqliteProvider();
}

export const db = {
  query: <T = any>(sql: string, params?: any[]) => activeProvider.query<T>(sql, params),
  execute: (sql: string, params?: any[]) => activeProvider.execute(sql, params),
  initialize: () => activeProvider.initialize()
};
