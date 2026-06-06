import { getDb } from '../connection.js'

const incrementColumns = new Set([
  'focus_minutes',
  'completed_sessions',
  'completed_tasks',
  'created_missions',
  'created_notes'
])

export function ensureDailySnapshot(day = null) {
  const snapshotDay = day ?? getDb().prepare("SELECT date('now') AS day").get().day

  getDb().prepare(`
    INSERT OR IGNORE INTO daily_snapshots (day)
    VALUES (?)
  `).run(snapshotDay)

  return getDailySnapshot(snapshotDay)
}

export function incrementDailySnapshot(column, amount = 1, day = null) {
  if (!incrementColumns.has(column)) {
    throw new Error(`Unsupported snapshot column: ${column}`)
  }

  const snapshotDay = day ?? getDb().prepare("SELECT date('now') AS day").get().day
  ensureDailySnapshot(snapshotDay)

  getDb().prepare(`
    UPDATE daily_snapshots
    SET ${column} = ${column} + ?,
        updated_at = datetime('now')
    WHERE day = ?
  `).run(amount, snapshotDay)

  return getDailySnapshot(snapshotDay)
}

export function getDailySnapshot(day) {
  return getDb().prepare('SELECT * FROM daily_snapshots WHERE day = ?').get(day)
}

export function listRecentSnapshots(days = 7) {
  return getDb().prepare(`
    SELECT * FROM daily_snapshots
    WHERE day >= date('now', ?)
    ORDER BY day ASC
  `).all(`-${Number(days) - 1} days`)
}
