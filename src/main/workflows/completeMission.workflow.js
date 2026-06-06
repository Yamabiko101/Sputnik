import { getDb } from '../database/connection.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { addPetXp } from '../database/repositories/pets.repository.js'
import { getMission, updateMission } from '../database/repositories/missions.repository.js'
import { evaluateAchievements } from '../services/achievement.service.js'

export function completeMissionWorkflow(id) {
  const db = getDb()

  const complete = db.transaction(() => {
    const mission = getMission(id)
    if (!mission) throw new Error('Mission not found.')

    const updated = updateMission(id, { status: 'completed' })

    createActivityEvent({
      eventType: 'mission_completed',
      missionId: id,
      title: `Completed mission: ${updated.title}`,
      details: { missionTitle: updated.title }
    })

    addPetXp(50, 'celebrating')
    evaluateAchievements()

    return updated
  })

  return complete()
}
