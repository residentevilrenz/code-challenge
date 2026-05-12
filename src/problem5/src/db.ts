import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";

let dbInstance: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

const dbFilePath = path.resolve(process.cwd(), "data", "resources.db");

async function initDb(db: Database<sqlite3.Database, sqlite3.Statement>): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!dbInstance) {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });

    dbInstance = open({
      filename: dbFilePath,
      driver: sqlite3.Database
    }).then(async (db) => {
      await initDb(db);
      return db;
    });
  }

  return dbInstance;
}
