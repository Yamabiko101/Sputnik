import { getDb } from '../connection.js'

export function listNotes() {
  return getDb().prepare(`
    SELECT notes.*, missions.title AS mission_title
    FROM notes
    LEFT JOIN missions ON missions.id = notes.mission_id
    ORDER BY notes.created_at DESC
  `).all()
}

export function getNote(id) {
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id)
}

export function createNote(data) {
  const result = getDb().prepare(`
    INSERT INTO notes (mission_id, title, body)
    VALUES (@missionId, @title, @body)
  `).run({
    missionId: data.missionId || null,
    title: data.title,
    body: data.body ?? ''
  })

  return getNote(result.lastInsertRowid)
}

export function updateNote(id, data) {
  const current = getNote(id)
  if (!current) return null

  getDb().prepare(`
    UPDATE notes
    SET mission_id = @missionId,
        title = @title,
        body = @body,
        updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    missionId: data.missionId ?? current.mission_id,
    title: data.title ?? current.title,
    body: data.body ?? current.body
  })

  return getNote(id)
}

export function deleteNote(id) {
  return getDb().prepare('DELETE FROM notes WHERE id = ?').run(id).changes > 0
}
