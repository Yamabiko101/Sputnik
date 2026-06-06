import { getDb } from './connection.js'
import initialSchemaSql from './migrations/001_v1_orbital_core.sql?raw'
import missionOsSql from './migrations/002_v2_mission_os.sql?raw'
import laikaProductSql from './migrations/003_v3_laika_product.sql?raw'

const migrations = [
  {
    version: '001_v1_orbital_core.sql',
    sql: initialSchemaSql
  },
  {
    version: '002_v2_mission_os.sql',
    sql: missionOsSql
  },
  {
    version: '003_v3_laika_product.sql',
    sql: laikaProductSql
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
