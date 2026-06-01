import { getDb } from '../database/connection.js'

export function getDashboardStats() {
  const db = getDb()
  const missionCounts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
    FROM missions
  `).get()

  const focusToday = db.prepare(`
    SELECT
      COALESCE(SUM(actual_minutes), 0) AS minutes,
      COUNT(*) AS sessions
    FROM focus_sessions
    WHERE status = 'completed'
      AND date(COALESCE(ended_at, created_at)) = date('now')
  `).get()

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(actual_minutes), 0) AS total_focus_minutes,
      COUNT(*) AS total_focus_sessions
    FROM focus_sessions
    WHERE status = 'completed'
  `).get()

  const nextMission = db.prepare(`
    SELECT * FROM missions
    WHERE status IN ('planned', 'active') AND due_date IS NOT NULL
    ORDER BY due_date ASC
    LIMIT 1
  `).get()

  return {
    activeMissions: Number(missionCounts.active ?? 0),
    completedMissions: Number(missionCounts.completed ?? 0),
    totalMissions: Number(missionCounts.total ?? 0),
    focusMinutesToday: Number(focusToday.minutes ?? 0),
    completedSessionsToday: Number(focusToday.sessions ?? 0),
    totalFocusMinutes: Number(totals.total_focus_minutes ?? 0),
    totalFocusSessions: Number(totals.total_focus_sessions ?? 0),
    nextMission: nextMission ?? null
  }
}

export function getWeeklyStats() {
  return getDb().prepare(`
    SELECT date(COALESCE(ended_at, created_at)) AS day,
           COALESCE(SUM(actual_minutes), 0) AS minutes
    FROM focus_sessions
    WHERE status = 'completed'
      AND date(COALESCE(ended_at, created_at)) >= date('now', '-6 days')
    GROUP BY day
    ORDER BY day ASC
  `).all()
}
