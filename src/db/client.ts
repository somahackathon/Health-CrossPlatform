import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('health-client.db');

export function migrate() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      birth_date TEXT NOT NULL,
      gender TEXT NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      school_grade INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS paps_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_item_code TEXT NOT NULL,
      component_code TEXT NOT NULL,
      test_item_name TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      grade INTEGER NOT NULL,
      standard_version_code TEXT,
      measured_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_paps_records_item ON paps_records (test_item_code, created_at);

    CREATE TABLE IF NOT EXISTS fitness_analyses (
      job_id TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL,
      model_version TEXT,
      summary TEXT,
      recommendations TEXT,
      failure_message TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS posture_analyses (
      job_id TEXT PRIMARY KEY NOT NULL,
      exercise_type TEXT NOT NULL,
      status TEXT NOT NULL,
      model_version TEXT,
      feedback TEXT,
      failure_message TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );
  `);

  // profile pre-dates school_grade — add it for databases created before this column existed.
  try {
    db.execSync('ALTER TABLE profile ADD COLUMN school_grade INTEGER NOT NULL DEFAULT 1');
  } catch {
    // column already exists
  }
}
