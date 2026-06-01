import { getDb } from '../connection.js'

export function getCurrentPet() {
  return getDb().prepare('SELECT * FROM pets WHERE id = 1').get()
}

export function setPetMood(mood) {
  getDb().prepare(`
    UPDATE pets
    SET mood = ?,
        updated_at = datetime('now')
    WHERE id = 1
  `).run(mood)

  return getCurrentPet()
}
