import { getDb } from '../connection.js'

export function listMissions() {
  return getDb().prepare('SELECT * FROM missions ORDER BY created_at DESC').all()
}

export function getMission(id) {
  return getDb().prepare('SELECT * FROM missions WHERE id = ?').get(id)
}

export function createMission(data) {
  const result = getDb().prepare(`
    INSERT INTO missions (title, description, status, priority, due_date)
    VALUES (@title, @description, @status, @priority, @dueDate)
  `).run({
    title: data.title,
    description: data.description ?? '',
    status: data.status ?? 'active',
    priority: data.priority ?? 'medium',
    dueDate: data.dueDate || null
  })

  return getMission(result.lastInsertRowid)
}

export function updateMission(id, data) {
  const current = getMission(id)
  if (!current) return null

  getDb().prepare(`
    UPDATE missions
    SET title = @title,
        description = @description,
        status = @status,
        priority = @priority,
        due_date = @dueDate,
        updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    title: data.title ?? current.title,
    description: data.description ?? current.description,
    status: data.status ?? current.status,
    priority: data.priority ?? current.priority,
    dueDate: data.dueDate ?? current.due_date
  })

  return getMission(id)
}

export function deleteMission(id) {
  return getDb().prepare('DELETE FROM missions WHERE id = ?').run(id).changes > 0
}

export function addMissionFocusMinutes(id, minutes) {
  getDb().prepare(`
    UPDATE missions
    SET total_focus_minutes = total_focus_minutes + ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(minutes, id)
}
