import { getDb } from '../database/connection.js'
import { completeFocusSession } from '../database/repositories/focus.repository.js'
import { addMissionFocusMinutes } from '../database/repositories/missions.repository.js'
import { addTaskFocusMinutes } from '../database/repositories/tasks.repository.js'
import { setPetMood } from '../database/repositories/pets.repository.js'

export function completeFocusSessionWorkflow(data) {
  const db = getDb()

  const complete = db.transaction(() => {
    const session = completeFocusSession(data)
    const minutes = Number(session.actual_minutes ?? data.actualMinutes ?? 0)

    if (session.mission_id && minutes > 0) {
      addMissionFocusMinutes(session.mission_id, minutes)
    }

    if (session.task_id && minutes > 0) {
      addTaskFocusMinutes(session.task_id, minutes)
    }

    const pet = setPetMood('celebrating')
    return { session, pet }
  })

  return complete()
}
