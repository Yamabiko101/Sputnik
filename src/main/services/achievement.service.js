import {
  getAchievementProgress,
  listAchievements,
  unlockAchievement
} from '../database/repositories/achievements.repository.js'
import { createActivityEvent } from '../database/repositories/activity.repository.js'

export function getAchievements() {
  const progress = getAchievementProgress()

  return listAchievements().map((achievement) => ({
    ...achievement,
    progress: progress[achievement.condition_type] ?? 0,
    target: achievement.condition_value
  }))
}

export function evaluateAchievements() {
  const progress = getAchievementProgress()
  const achievements = listAchievements()
  const unlocked = []

  for (const achievement of achievements) {
    if (achievement.unlocked) continue

    const current = progress[achievement.condition_type] ?? 0
    if (current >= achievement.condition_value) {
      const unlockedAchievement = unlockAchievement(achievement.id)
      createActivityEvent({
        eventType: 'achievement_unlocked',
        title: `Achievement unlocked: ${achievement.title}`,
        details: { achievementKey: achievement.key, achievementTitle: achievement.title }
      })
      unlocked.push(unlockedAchievement)
    }
  }

  return unlocked
}
