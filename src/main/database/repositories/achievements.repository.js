import { getDb } from '../connection.js'

export function listAchievements() {
  return getDb().prepare(`
    SELECT
      achievements.*,
      user_achievements.unlocked_at,
      CASE WHEN user_achievements.achievement_id IS NULL THEN 0 ELSE 1 END AS unlocked
    FROM achievements
    LEFT JOIN user_achievements ON user_achievements.achievement_id = achievements.id
    ORDER BY unlocked DESC, achievements.id ASC
  `).all()
}

export function unlockAchievement(id) {
  getDb().prepare(`
    INSERT OR IGNORE INTO user_achievements (achievement_id)
    VALUES (?)
  `).run(id)

  return getDb().prepare(`
    SELECT achievements.*, user_achievements.unlocked_at
    FROM achievements
    JOIN user_achievements ON user_achievements.achievement_id = achievements.id
    WHERE achievements.id = ?
  `).get(id)
}

export function getAchievementProgress() {
  const db = getDb()
  const focus = db.prepare("SELECT COUNT(*) AS count FROM focus_sessions WHERE status = 'completed'").get().count
  const tasks = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE status = 'done'").get().count
  const missionsCreated = db.prepare('SELECT COUNT(*) AS count FROM missions').get().count
  const missionsCompleted = db.prepare("SELECT COUNT(*) AS count FROM missions WHERE status = 'completed'").get().count
  const notes = db.prepare('SELECT COUNT(*) AS count FROM notes').get().count
  const pro = db.prepare("SELECT CASE WHEN current_plan = 'pro' THEN 1 ELSE 0 END AS active FROM user_profile WHERE id = 1").get().active

  return {
    focus_sessions: Number(focus),
    tasks_completed: Number(tasks),
    missions_created: Number(missionsCreated),
    missions_completed: Number(missionsCompleted),
    notes_created: Number(notes),
    pro_activated: Number(pro)
  }
}
