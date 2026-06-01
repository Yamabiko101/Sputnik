import { getDb } from '../connection.js'

export function listTasks() {
  return getDb().prepare('SELECT * FROM tasks ORDER BY created_at ASC').all()
}

export function listTasksByMission(missionId) {
  return getDb().prepare('SELECT * FROM tasks WHERE mission_id = ? ORDER BY created_at ASC').all(missionId)
}

export function getTask(id) {
  return getDb().prepare('SELECT * FROM tasks WHERE id = ?').get(id)
}

export function createTask(data) {
  const result = getDb().prepare(`
    INSERT INTO tasks (mission_id, title)
    VALUES (@missionId, @title)
  `).run({
    missionId: data.missionId,
    title: data.title
  })

  return getTask(result.lastInsertRowid)
}

export function updateTask(id, data) {
  const current = getTask(id)
  if (!current) return null

  getDb().prepare(`
    UPDATE tasks
    SET title = @title,
        status = @status,
        updated_at = datetime('now'),
        completed_at = @completedAt
    WHERE id = @id
  `).run({
    id,
    title: data.title ?? current.title,
    status: data.status ?? current.status,
    completedAt: data.status === 'done' ? new Date().toISOString() : current.completed_at
  })

  return getTask(id)
}

export function completeTask(id) {
  getDb().prepare(`
    UPDATE tasks
    SET status = 'done',
        completed_at = COALESCE(completed_at, datetime('now')),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(id)

  return getTask(id)
}

export function deleteTask(id) {
  return getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0
}

export function addTaskFocusMinutes(id, minutes) {
  getDb().prepare(`
    UPDATE tasks
    SET focus_minutes = focus_minutes + ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(minutes, id)
}
