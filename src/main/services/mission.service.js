import {
  createMission,
  deleteMission,
  getMission,
  listMissions,
  updateMission
} from '../database/repositories/missions.repository.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { getDb } from '../database/connection.js'
import { incrementDailySnapshot } from '../database/repositories/snapshots.repository.js'
import { listTasksByMission } from '../database/repositories/tasks.repository.js'
import { evaluateAchievements } from './achievement.service.js'
import { completeMissionWorkflow } from '../workflows/completeMission.workflow.js'

function withProgress(mission) {
  if (!mission) return null
  const tasks = listTasksByMission(mission.id)
  const completed = tasks.filter((task) => task.status === 'done').length
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)
  return { ...mission, tasks, progress, completed_tasks: completed, task_count: tasks.length }
}

function requireTitle(title) {
  if (!title || !String(title).trim()) {
    throw new Error('Mission title is required.')
  }
}

export function getAllMissions() {
  return listMissions().map(withProgress)
}

export function getMissionById(id) {
  const mission = withProgress(getMission(id))
  if (!mission) throw new Error('Mission not found.')
  return mission
}

export function createMissionService(data) {
  requireTitle(data?.title)
  const db = getDb()
  const create = db.transaction(() => {
    const mission = createMission({ ...data, title: data.title.trim() })
    incrementDailySnapshot('created_missions')
    createActivityEvent({
      eventType: 'mission_created',
      missionId: mission.id,
      title: `Created mission: ${mission.title}`,
      details: { priority: mission.priority, dueDate: mission.due_date }
    })
    evaluateAchievements()
    return mission
  })

  return withProgress(create())
}

export function updateMissionService(id, data) {
  if (data?.title !== undefined) requireTitle(data.title)
  if (data?.status === 'completed') {
    return withProgress(completeMissionWorkflow(id))
  }
  const db = getDb()
  const update = db.transaction(() => {
    const mission = updateMission(id, data)
    if (!mission) throw new Error('Mission not found.')
    createActivityEvent({
      eventType: 'mission_updated',
      missionId: mission.id,
      title: `Updated mission: ${mission.title}`,
      details: { missionTitle: mission.title }
    })
    return mission
  })

  return withProgress(update())
}

export function removeMissionService(id) {
  const db = getDb()
  const remove = db.transaction(() => {
    const mission = getMission(id)
    if (!mission) throw new Error('Mission not found.')
    createActivityEvent({
      eventType: 'mission_deleted',
      missionId: mission.id,
      title: `Deleted mission: ${mission.title}`,
      details: { missionTitle: mission.title }
    })
    return deleteMission(id)
  })

  return remove()
}
