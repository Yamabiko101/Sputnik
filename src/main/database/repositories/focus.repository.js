import { getDb } from '../connection.js'

export function startFocusSession(data) {
  const result = getDb().prepare(`
    INSERT INTO focus_sessions (mission_id, task_id, mode, status, planned_minutes, actual_minutes, started_at)
    VALUES (@missionId, @taskId, @mode, 'running', @plannedMinutes, 0, datetime('now'))
  `).run({
    missionId: data.missionId || null,
    taskId: data.taskId || null,
    mode: data.mode ?? 'focus',
    plannedMinutes: data.plannedMinutes ?? 25
  })

  return getFocusSession(result.lastInsertRowid)
}

export function completeFocusSession(data) {
  if (data.id) {
    getDb().prepare(`
      UPDATE focus_sessions
      SET status = 'completed',
          actual_minutes = @actualMinutes,
          ended_at = datetime('now')
      WHERE id = @id
    `).run({
      id: data.id,
      actualMinutes: data.actualMinutes ?? data.plannedMinutes ?? 25
    })

    return getFocusSession(data.id)
  }

  const result = getDb().prepare(`
    INSERT INTO focus_sessions (mission_id, task_id, mode, status, planned_minutes, actual_minutes, ended_at)
    VALUES (@missionId, @taskId, @mode, 'completed', @plannedMinutes, @actualMinutes, datetime('now'))
  `).run({
    missionId: data.missionId || null,
    taskId: data.taskId || null,
    mode: data.mode ?? 'focus',
    plannedMinutes: data.plannedMinutes ?? 25,
    actualMinutes: data.actualMinutes ?? data.plannedMinutes ?? 25
  })

  return getFocusSession(result.lastInsertRowid)
}

export function cancelFocusSession(id) {
  getDb().prepare(`
    UPDATE focus_sessions
    SET status = 'cancelled',
        ended_at = datetime('now')
    WHERE id = ?
  `).run(id)

  return getFocusSession(id)
}

export function getFocusSession(id) {
  return getDb().prepare('SELECT * FROM focus_sessions WHERE id = ?').get(id)
}
