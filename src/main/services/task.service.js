import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  updateTask
} from '../database/repositories/tasks.repository.js'
import { getMission } from '../database/repositories/missions.repository.js'

function requireTaskData(data) {
  if (!data?.missionId || !getMission(data.missionId)) {
    throw new Error('A valid mission is required.')
  }
  if (!data?.title || !String(data.title).trim()) {
    throw new Error('Task title is required.')
  }
}

export function createTaskService(data) {
  requireTaskData(data)
  return createTask({ ...data, title: data.title.trim() })
}

export function updateTaskService(id, data) {
  if (data?.title !== undefined && !String(data.title).trim()) {
    throw new Error('Task title is required.')
  }
  return updateTask(id, data)
}

export function completeTaskService(id) {
  const task = getTask(id)
  if (!task) throw new Error('Task not found.')
  return completeTask(id)
}

export function removeTaskService(id) {
  return deleteTask(id)
}
