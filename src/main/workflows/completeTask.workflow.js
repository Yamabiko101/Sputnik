import { getDb } from '../database/connection.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { addPetXp } from '../database/repositories/pets.repository.js'
import { incrementDailySnapshot } from '../database/repositories/snapshots.repository.js'
import { completeTask, getTask } from '../database/repositories/tasks.repository.js'
import { evaluateAchievements } from '../services/achievement.service.js'

export function completeTaskWorkflow(id) {
  const db = getDb()

  const complete = db.transaction(() => {
    const before = getTask(id)
    if (!before) throw new Error('Task not found.')

    const task = completeTask(id)

    if (before.status !== 'done') {
      incrementDailySnapshot('completed_tasks')
      createActivityEvent({
        eventType: 'task_completed',
        missionId: task.mission_id,
        taskId: task.id,
        title: `Completed task: ${task.title}`,
        details: { taskTitle: task.title }
      })
      addPetXp(15, 'celebrating')
    }

    evaluateAchievements()
    return task
  })

  return complete()
}
