import { getDb } from '../connection.js'

export function createActivityEvent(data) {
  const result = getDb().prepare(`
    INSERT INTO activity_events (
      event_type,
      mission_id,
      task_id,
      note_id,
      focus_session_id,
      title,
      details
    )
    VALUES (
      @eventType,
      @missionId,
      @taskId,
      @noteId,
      @focusSessionId,
      @title,
      @details
    )
  `).run({
    eventType: data.eventType,
    missionId: data.missionId || null,
    taskId: data.taskId || null,
    noteId: data.noteId || null,
    focusSessionId: data.focusSessionId || null,
    title: data.title,
    details: JSON.stringify(data.details ?? {})
  })

  return getDb().prepare('SELECT * FROM activity_events WHERE id = ?').get(result.lastInsertRowid)
}

export function listRecentActivity(limit = 12) {
  return getDb().prepare(`
    SELECT
      activity_events.*,
      missions.title AS mission_title,
      tasks.title AS task_title
    FROM activity_events
    LEFT JOIN missions ON missions.id = activity_events.mission_id
    LEFT JOIN tasks ON tasks.id = activity_events.task_id
    ORDER BY activity_events.created_at DESC
    LIMIT ?
  `).all(limit)
}

export function listMissionActivity(missionId, limit = 25) {
  return getDb().prepare(`
    SELECT * FROM activity_events
    WHERE mission_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(missionId, limit)
}
