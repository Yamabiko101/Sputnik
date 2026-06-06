import { createNote, deleteNote, listNotes, updateNote } from '../database/repositories/notes.repository.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { getDb } from '../database/connection.js'
import { incrementDailySnapshot } from '../database/repositories/snapshots.repository.js'
import { evaluateAchievements } from './achievement.service.js'

function requireNoteTitle(title) {
  if (!title || !String(title).trim()) {
    throw new Error('Note title is required.')
  }
}

export function getAllNotes() {
  return listNotes()
}

export function createNoteService(data) {
  requireNoteTitle(data?.title)
  const db = getDb()
  const create = db.transaction(() => {
    const note = createNote({ ...data, title: data.title.trim() })
    incrementDailySnapshot('created_notes')
    createActivityEvent({
      eventType: 'note_created',
      missionId: note.mission_id,
      noteId: note.id,
      title: `Crew log saved: ${note.title}`,
      details: { noteTitle: note.title }
    })
    evaluateAchievements()
    return note
  })

  return create()
}

export function updateNoteService(id, data) {
  if (data?.title !== undefined) requireNoteTitle(data.title)
  return updateNote(id, data)
}

export function removeNoteService(id) {
  return deleteNote(id)
}
