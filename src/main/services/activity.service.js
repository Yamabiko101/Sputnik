import { listRecentActivity } from '../database/repositories/activity.repository.js'

export function getRecentActivity(limit = 12) {
  return listRecentActivity(Number(limit) || 12)
}
