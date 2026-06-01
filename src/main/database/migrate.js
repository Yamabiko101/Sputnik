import { getDb } from './connection.js'
import initialSchemaSql from './migrations/001_v1_orbital_core.sql?raw'

const migrations = [
  {
    version: '001_v1_orbital_core.sql',
    sql: initialSchemaSql
  }
]

export function runMigrations() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((row) => row.version)
  )

  for (const migration of migrations) {
    if (applied.has(migration.version)) continue
    const apply = db.transaction(() => {
      db.exec(migration.sql)
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version)
    })
    apply()
  }
}
