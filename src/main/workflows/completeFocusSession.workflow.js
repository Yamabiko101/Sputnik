import { getDb } from '../database/connection.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { completeFocusSession } from '../database/repositories/focus.repository.js'
import { addMissionFocusMinutes } from '../database/repositories/missions.repository.js'
import { incrementDailySnapshot } from '../database/repositories/snapshots.repository.js'
import { addTaskFocusMinutes } from '../database/repositories/tasks.repository.js'
import { addPetXp } from '../database/repositories/pets.repository.js'
import { evaluateAchievements } from '../services/achievement.service.js'

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

    incrementDailySnapshot('focus_minutes', minutes)
    incrementDailySnapshot('completed_sessions')

    createActivityEvent({
      eventType: 'focus_completed',
      missionId: session.mission_id,
      taskId: session.task_id,
      focusSessionId: session.id,
      title: `Completed ${minutes} minute focus session`,
      details: {
        mode: session.mode,
        plannedMinutes: session.planned_minutes,
        actualMinutes: minutes
      }
    })

    const pet = addPetXp(Math.max(10, minutes * 2), 'celebrating')
    const unlockedAchievements = evaluateAchievements()

    return { session, pet, unlockedAchievements }
  })

  return complete()
}
