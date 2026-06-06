import { getDb } from '../database/connection.js'
import { listRecentActivity } from '../database/repositories/activity.repository.js'
import { listRecentSnapshots } from '../database/repositories/snapshots.repository.js'

function getCurrentStreak(db) {
  const rows = db.prepare(`
    SELECT day
    FROM daily_snapshots
    WHERE focus_minutes > 0
    ORDER BY day DESC
  `).all()

  let streak = 0
  let expected = db.prepare("SELECT date('now') AS day").get().day

  for (const row of rows) {
    if (row.day === expected) {
      streak += 1
      expected = db.prepare("SELECT date(?, '-1 day') AS day").get(expected).day
      continue
    }

    if (streak === 0 && row.day === db.prepare("SELECT date('now', '-1 day') AS day").get().day) {
      streak += 1
      expected = db.prepare("SELECT date(?, '-1 day') AS day").get(row.day).day
      continue
    }

    break
  }

  return streak
}

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

  const todaySnapshot = db.prepare(`
    SELECT * FROM daily_snapshots
    WHERE day = date('now')
  `).get()

  return {
    activeMissions: Number(missionCounts.active ?? 0),
    completedMissions: Number(missionCounts.completed ?? 0),
    totalMissions: Number(missionCounts.total ?? 0),
    focusMinutesToday: Number(todaySnapshot?.focus_minutes ?? focusToday.minutes ?? 0),
    completedSessionsToday: Number(todaySnapshot?.completed_sessions ?? focusToday.sessions ?? 0),
    completedTasksToday: Number(todaySnapshot?.completed_tasks ?? 0),
    createdMissionsToday: Number(todaySnapshot?.created_missions ?? 0),
    createdNotesToday: Number(todaySnapshot?.created_notes ?? 0),
    totalFocusMinutes: Number(totals.total_focus_minutes ?? 0),
    totalFocusSessions: Number(totals.total_focus_sessions ?? 0),
    currentStreak: getCurrentStreak(db),
    recentActivity: listRecentActivity(8),
    nextMission: nextMission ?? null
  }
}

export function getWeeklyStats() {
  return listRecentSnapshots(7).map((snapshot) => ({
    day: snapshot.day,
    minutes: snapshot.focus_minutes,
    sessions: snapshot.completed_sessions,
    tasks: snapshot.completed_tasks
  }))
}
