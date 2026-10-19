import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { SCHEMA_SQL } from './schema';

let dbInstance: DatabaseSync | null = null;

/**
 * Mendapatkan koneksi instance Database SQLite
 */
export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.resolve(process.cwd(), 'data/db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'simcat.db');
  dbInstance = new DatabaseSync(dbPath);

  // Performance & Integrity PRAGMAs
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA synchronous = NORMAL;');

  // Run initial schema creation
  dbInstance.exec(SCHEMA_SQL);

  return dbInstance;
}

/**
 * Helper untuk query single row
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.get(...params);
  return (result as T) || null;
}

/**
 * Helper untuk query multiple rows
 */
export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  const results = stmt.all(...params);
  return (results as T[]) || [];
}

/**
 * Helper untuk execute insert/update/delete
 */
export function execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}
