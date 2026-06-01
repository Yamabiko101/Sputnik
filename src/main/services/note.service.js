import { createNote, deleteNote, listNotes, updateNote } from '../database/repositories/notes.repository.js'

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
  return createNote({ ...data, title: data.title.trim() })
}

export function updateNoteService(id, data) {
  if (data?.title !== undefined) requireNoteTitle(data.title)
  return updateNote(id, data)
}

export function removeNoteService(id) {
  return deleteNote(id)
}
