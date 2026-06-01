import {
  createMission,
  deleteMission,
  getMission,
  listMissions,
  updateMission
} from '../database/repositories/missions.repository.js'
import { listTasksByMission } from '../database/repositories/tasks.repository.js'

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
  return withProgress(createMission({ ...data, title: data.title.trim() }))
}

export function updateMissionService(id, data) {
  if (data?.title !== undefined) requireTitle(data.title)
  return withProgress(updateMission(id, data))
}

export function removeMissionService(id) {
  return deleteMission(id)
}
