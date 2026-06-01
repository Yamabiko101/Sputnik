import { getDb } from './connection.js'

export function seedDatabase() {
  const db = getDb()

  const seed = db.transaction(() => {
    db.prepare(`
      INSERT OR IGNORE INTO user_profile (id, display_name, current_plan)
      VALUES (1, 'Commander', 'free')
    `).run()

    db.prepare(`
      INSERT OR IGNORE INTO pets (id, name, mood)
      VALUES (1, 'Laika', 'ready')
    `).run()

    db.prepare(`
      INSERT OR IGNORE INTO app_settings (key, value)
      VALUES
        ('focus_minutes', '25'),
        ('short_break_minutes', '5'),
        ('long_break_minutes', '15')
    `).run()
  })

  seed()
}
