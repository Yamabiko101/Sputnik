import { createNote, deleteNote, getNote, listNotes, updateNote } from '../database/repositories/notes.repository.js'
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
  const db = getDb()
  const update = db.transaction(() => {
    const note = updateNote(id, data)
    if (!note) throw new Error('Crew log not found.')
    createActivityEvent({
      eventType: 'note_updated',
      missionId: note.mission_id,
      noteId: note.id,
      title: `Updated Crew Log: ${note.title}`,
      details: { noteTitle: note.title }
    })
    return note
  })

  return update()
}

export function removeNoteService(id) {
  const db = getDb()
  const remove = db.transaction(() => {
    const note = getNote(id)
    if (!note) throw new Error('Crew log not found.')
    createActivityEvent({
      eventType: 'note_deleted',
      missionId: note.mission_id,
      noteId: note.id,
      title: `Deleted Crew Log: ${note.title}`,
      details: { noteTitle: note.title }
    })
    return deleteNote(id)
  })

  return remove()
}
