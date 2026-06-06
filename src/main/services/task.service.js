import {
  createTask,
  deleteTask,
  getTask,
  updateTask
} from '../database/repositories/tasks.repository.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'
import { getDb } from '../database/connection.js'
import { getMission } from '../database/repositories/missions.repository.js'
import { completeTaskWorkflow } from '../workflows/completeTask.workflow.js'

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
  const db = getDb()
  const create = db.transaction(() => {
    const task = createTask({ ...data, title: data.title.trim() })
    createActivityEvent({
      eventType: 'task_created',
      missionId: task.mission_id,
      taskId: task.id,
      title: `Added task: ${task.title}`,
      details: { taskTitle: task.title }
    })
    return task
  })

  return create()
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
  return completeTaskWorkflow(id)
}

export function removeTaskService(id) {
  return deleteTask(id)
}
