import { getDb } from '../connection.js'

export function listSettings() {
  const rows = getDb().prepare('SELECT key, value FROM app_settings ORDER BY key').all()
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

export function setSetting(key, value) {
  getDb().prepare(`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(key, String(value))

  return listSettings()
}

export function deleteSetting(key) {
  getDb().prepare('DELETE FROM app_settings WHERE key = ?').run(key)
  return listSettings()
}

export function activateProPlan() {
  getDb().prepare(`
    UPDATE user_profile
    SET current_plan = 'pro',
        updated_at = datetime('now')
    WHERE id = 1
  `).run()

  return getDb().prepare('SELECT * FROM user_profile WHERE id = 1').get()
}

export function getUserProfile() {
  return getDb().prepare('SELECT * FROM user_profile WHERE id = 1').get()
}
