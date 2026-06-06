import { getDb } from '../database/connection.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { activateProPlan } from '../database/repositories/settings.repository.js'
import { evaluateAchievements } from '../services/achievement.service.js'

export function activateProPlanWorkflow() {
  const db = getDb()

  const activate = db.transaction(() => {
    const profile = activateProPlan()

    createActivityEvent({
      eventType: 'pro_simulation_activated',
      title: 'Activated Sputnik Pro simulation',
      details: { plan: profile.current_plan }
    })

    evaluateAchievements()

    return profile
  })

  return activate()
}
