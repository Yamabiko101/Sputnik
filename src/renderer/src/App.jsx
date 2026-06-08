import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Bot,
  Check,
  ClipboardList,
  Crown,
  Database,
  Edit3,
  Gauge,
  Home,
  Lock,
  Minus,
  NotebookText,
  Palette,
  PawPrint,
  Play,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings,
  Shield,
  Sparkles,
  TimerReset,
  Trash2,
  Trophy,
  User
} from 'lucide-react'
import { AppLayout } from './app/layout/AppLayout.jsx'
import { EmptyState } from './shared/components/EmptyState.jsx'
import { PetSprite } from './shared/components/pixel/PetSprite.jsx'
import { ProfileAvatar } from './shared/components/pixel/ProfileAvatar.jsx'
import { PROFILE_AVATARS } from './shared/assets/pixel/profileAvatars.js'

const api = window.sputnik

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'missions', label: 'Missions', icon: ClipboardList },
  { id: 'focus', label: 'Focus', icon: TimerReset },
  { id: 'notes', label: 'Crew Log', icon: NotebookText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'companion', label: 'Companion', icon: PawPrint },
  { id: 'mentor', label: 'Kosmo AI', icon: Bot },
  { id: 'pro', label: 'Sputnik Pro', icon: Crown },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const APP_THEMES = [
  {
    key: 'orbital-core',
    name: 'Orbital Core',
    description: 'The original warm Sputnik command center.',
    isPremium: false,
    swatches: ['#12100e', '#1d1916', '#c83a32', '#f4b95e']
  },
  {
    key: 'catppuccin',
    name: 'Catppuccin',
    description: 'A soft pastel command center with lavender, rose, and calm midnight surfaces.',
    isPremium: true,
    swatches: ['#1e1e2e', '#313244', '#cba6f7', '#f5c2e7']
  },
  {
    key: 'gruvbox',
    name: 'Gruvbox',
    description: 'A warm retro terminal theme with earthy panels and classic hacker colors.',
    isPremium: true,
    swatches: ['#282828', '#3c3836', '#fabd2f', '#b8bb26']
  },
  {
    key: 'gruvbox-light',
    name: 'Gruvbox Light',
    description: 'A soft paper-like Gruvbox variant with warm contrast and readable terminal accents.',
    isPremium: true,
    swatches: ['#fbf1c7', '#ebdbb2', '#af3a03', '#79740e']
  }
]

function getThemeKey(themeKey) {
  return APP_THEMES.some((theme) => theme.key === themeKey) ? themeKey : 'orbital-core'
}

function getFriendlyErrorMessage(message) {
  if (!message) return 'Something went wrong. Check the form and try again.'
  if (message.includes('Note title is required')) return 'Add a log title before saving.'
  if (message.includes('Mission title is required')) return 'Add a mission title before saving.'
  if (message.includes('Task title is required')) return 'Add a task title before saving.'
  return message
}

export function App() {
  const [authReady, setAuthReady] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [view, setView] = useState('dashboard')
  const [missions, setMissions] = useState([])
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [weeklyStats, setWeeklyStats] = useState([])
  const [pet, setPet] = useState(null)
  const [skins, setSkins] = useState([])
  const [achievements, setAchievements] = useState([])
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState({})
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [message, setMessage] = useState('')
  const [focusTimer, setFocusTimer] = useState({
    secondsLeft: 25 * 60,
    status: 'ready',
    plannedMinutes: 25,
    sessionId: null,
    label: 'Quick focus'
  })

  async function refresh() {
    const [
      missionData,
      noteData,
      statData,
      activityData,
      weeklyData,
      petData,
      skinData,
      achievementData,
      profileData,
      settingData
    ] = await Promise.all([
      api.missions.getAll(),
      api.notes.getAll(),
      api.stats.getDashboard(),
      api.activity.getRecent(10),
      api.stats.getWeekly(),
      api.pets.getCurrent(),
      api.pets.getSkins(),
      api.achievements.getAll(),
      api.pro.getProfile(),
      api.settings.getAll()
    ])
    setMissions(missionData)
    setNotes(noteData)
    setStats(statData)
    setActivity(activityData)
    setWeeklyStats(weeklyData)
    setPet(petData)
    setSkins(skinData)
    setAchievements(achievementData)
    setProfile(profileData)
    setSettings(settingData)

    if (!selectedMissionId && missionData[0]) {
      setSelectedMissionId(String(missionData[0].id))
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        const [profileList, activeProfile] = await Promise.all([
          api.auth.listProfiles(),
          api.auth.getCurrentProfile()
        ])
        setProfiles(profileList)
        setCurrentProfile(activeProfile)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setAuthReady(true)
      }
    }

    boot()
  }, [])

  useEffect(() => {
    if (currentProfile) refresh()
  }, [currentProfile?.id])

  useEffect(() => {
    const nextPlannedMinutes = Number(settings.focus_minutes ?? 25)
    setFocusTimer((current) => {
      if (current.status !== 'ready' || current.sessionId) return current
      return {
        ...current,
        plannedMinutes: nextPlannedMinutes,
        secondsLeft: nextPlannedMinutes * 60
      }
    })
  }, [settings.focus_minutes])

  useEffect(() => {
    document.body.dataset.theme = getThemeKey(settings.app_theme)
  }, [settings.app_theme])

  useEffect(() => {
    if (focusTimer.status !== 'running') return undefined
    const timer = window.setInterval(() => {
      setFocusTimer((current) => ({
        ...current,
        secondsLeft: Math.max(current.secondsLeft - 1, 0)
      }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [focusTimer.status])

  useEffect(() => {
    if (focusTimer.secondsLeft === 0 && focusTimer.status === 'running') {
      setFocusTimer((current) => ({ ...current, status: 'completed' }))
    }
  }, [focusTimer.secondsLeft, focusTimer.status])

  const selectedMission = useMemo(
    () => missions.find((mission) => String(mission.id) === String(selectedMissionId)),
    [missions, selectedMissionId]
  )

  const selectedTask = useMemo(
    () => selectedMission?.tasks?.find((task) => String(task.id) === String(selectedTaskId)),
    [selectedMission, selectedTaskId]
  )

  function resetWorkspace() {
    setMissions([])
    setNotes([])
    setStats(null)
    setActivity([])
    setWeeklyStats([])
    setPet(null)
    setSkins([])
    setAchievements([])
    setProfile(null)
    setSettings({})
    setSelectedMissionId('')
    setSelectedTaskId('')
    setFocusTimer({
      secondsLeft: 25 * 60,
      status: 'ready',
      plannedMinutes: 25,
      sessionId: null,
      label: 'Quick focus'
    })
  }

  function applyAuthResult(result) {
    setProfiles(result.profiles ?? [])
    setCurrentProfile(result.profile ?? null)
    setView('dashboard')
  }

  async function handleLogout() {
    resetWorkspace()
    setCurrentProfile(null)
    setView('dashboard')

    try {
      const result = await api.auth.logout()
      setProfiles(result.profiles ?? [])
      setMessage('Signed out.')
    } catch (error) {
      setMessage(getFriendlyErrorMessage(error.message))
    }
  }

  async function startOrPauseFocus() {
    if (focusTimer.status === 'running') {
      setFocusTimer((current) => ({ ...current, status: 'paused' }))
      return
    }

    if (focusTimer.status === 'paused' && focusTimer.sessionId) {
      setFocusTimer((current) => ({ ...current, status: 'running' }))
      return
    }

    const plannedMinutes = Number(focusTimer.plannedMinutes || settings.focus_minutes || 25)
    const session = await api.focus.startSession({
      missionId: selectedMission?.id ?? null,
      taskId: selectedTask?.id ?? null,
      mode: 'focus',
      plannedMinutes
    })
    const label = selectedMission
      ? `${selectedMission.title}${selectedTask ? ` · ${selectedTask.title}` : ''}`
      : 'Quick focus'
    setFocusTimer({
      secondsLeft: plannedMinutes * 60,
      status: 'running',
      plannedMinutes,
      sessionId: session.id,
      label
    })
  }

  async function resetFocusTimer() {
    if (focusTimer.sessionId) {
      await api.focus.cancelSession(focusTimer.sessionId)
    }
    setFocusTimer((current) => ({
      secondsLeft: current.plannedMinutes * 60,
      status: 'ready',
      plannedMinutes: current.plannedMinutes,
      sessionId: null,
      label: 'Quick focus'
    }))
  }

  async function completeFocusNow() {
    await api.focus.completeSession({
      id: focusTimer.sessionId,
      missionId: selectedMission?.id ?? null,
      taskId: selectedTask?.id ?? null,
      mode: 'focus',
      plannedMinutes: focusTimer.plannedMinutes,
      actualMinutes: focusTimer.plannedMinutes
    })
    setFocusTimer((current) => ({
      ...current,
      secondsLeft: 0,
      status: 'completed',
      sessionId: null
    }))
    await refresh()
    setMessage('Focus session saved.')
  }

  async function runAction(action, successMessage) {
    try {
      await action()
      await refresh()
      setMessage(successMessage)
      return true
    } catch (error) {
      setMessage(getFriendlyErrorMessage(error.message))
      return false
    }
  }

  if (!authReady) {
    return <LoadingScreen message="Opening mission control..." />
  }

  if (!currentProfile) {
    return (
      <AuthGate
        profiles={profiles}
        onCreateProfile={async (data) => applyAuthResult(await api.auth.createProfile(data))}
        onLogin={async (data) => applyAuthResult(await api.auth.login(data))}
        message={message}
        onMessage={setMessage}
      />
    )
  }

  return (
    <AppLayout
      navItems={navItems}
      currentView={view}
      onNavigate={setView}
      activeMission={selectedMission}
      pet={pet}
      profile={currentProfile}
    >
      {message && (
        <button className="toast" onClick={() => setMessage('')}>
          {message}
        </button>
      )}

      {view === 'dashboard' && (
        <Dashboard
          stats={stats}
          pet={pet}
          missions={missions}
          activity={activity}
          onStartFocus={() => setView('focus')}
          onNewMission={() => setView('missions')}
        />
      )}

      {view === 'missions' && (
        <Missions
          missions={missions}
          selectedMissionId={selectedMissionId}
          onSelectMission={(id) => {
            setSelectedMissionId(String(id))
            setSelectedTaskId('')
          }}
          onCreateMission={(data) =>
            runAction(() => api.missions.create(data), 'Mission created.')
          }
          onUpdateMission={(id, data) =>
            runAction(() => api.missions.update(id, data), 'Mission updated.')
          }
          onDeleteMission={(id) =>
            runAction(() => api.missions.remove(id), 'Mission deleted.')
          }
          onCreateTask={(data) => runAction(() => api.tasks.create(data), 'Task added.')}
          onUpdateTask={(id, data) => runAction(() => api.tasks.update(id, data), 'Task updated.')}
          onCompleteTask={(id) => runAction(() => api.tasks.complete(id), 'Task completed.')}
          onDeleteTask={(id) => runAction(() => api.tasks.remove(id), 'Task deleted.')}
          onCompleteMission={(id) =>
            runAction(() => api.missions.update(id, { status: 'completed' }), 'Mission completed.')
          }
          onStartFocus={(missionId, taskId) => {
            setSelectedMissionId(String(missionId))
            setSelectedTaskId(taskId ? String(taskId) : '')
            setView('focus')
          }}
        />
      )}

      {view === 'focus' && (
        <Focus
          missions={missions}
          pet={pet}
          selectedMissionId={selectedMissionId}
          selectedTaskId={selectedTaskId}
          selectedMission={selectedMission}
          selectedTask={selectedTask}
          settings={settings}
          timer={focusTimer}
          onSelectMission={(id) => {
            setSelectedMissionId(String(id))
            setSelectedTaskId('')
          }}
          onSelectTask={(id) => setSelectedTaskId(String(id))}
          onStartPause={startOrPauseFocus}
          onReset={resetFocusTimer}
          onComplete={completeFocusNow}
        />
      )}

      {view === 'notes' && (
        <CrewLog
          notes={notes}
          missions={missions}
          onCreateNote={(data) => runAction(() => api.notes.create(data), 'Crew log saved.')}
          onUpdateNote={(id, data) => runAction(() => api.notes.update(id, data), 'Crew log updated.')}
          onDeleteNote={(id) => runAction(() => api.notes.remove(id), 'Crew log deleted.')}
        />
      )}

      {view === 'stats' && <Stats stats={stats} missions={missions} weeklyStats={weeklyStats} />}
      {view === 'achievements' && <Achievements achievements={achievements} />}
      {view === 'companion' && (
        <Companion
          pet={pet}
          skins={skins}
          onSelectSkin={(id) => runAction(() => api.pets.selectSkin(id), 'Laika skin selected.')}
        />
      )}
      {view === 'mentor' && <KosmoAI />}
      {view === 'pro' && (
        <ProSimulation
          profile={profile}
          skins={skins}
          themes={APP_THEMES}
          onActivate={() =>
            runAction(async () => {
              await api.pro.activateSimulation()
              setCurrentProfile(await api.auth.getCurrentProfile())
            }, 'Sputnik Pro simulation activated.')
          }
        />
      )}
      {view === 'settings' && (
        <SettingsPanel
          settings={settings}
          themes={APP_THEMES}
          profile={currentProfile}
          onSaveSetting={(key, value) =>
            runAction(() => api.settings.set(key, value), 'Settings saved.')
          }
          onUpdateProfile={async (data) => {
            try {
              const result = await api.auth.updateProfile(data)
              applyAuthResult(result)
              setMessage('Profile updated.')
            } catch (error) {
              setMessage(getFriendlyErrorMessage(error.message))
            }
          }}
          onChangePassword={(data) =>
            runAction(() => api.auth.changePassword(data), 'Password updated.')
          }
          onLogout={handleLogout}
          onDeleteProfile={async (data) => {
            try {
              const result = await api.auth.deleteProfile({ ...data, profileId: currentProfile.id })
              resetWorkspace()
              applyAuthResult(result)
              setMessage('Profile deleted.')
            } catch (error) {
              setMessage(getFriendlyErrorMessage(error.message))
            }
          }}
        />
      )}
    </AppLayout>
  )
}

function LoadingScreen({ message }) {
  return (
    <main className="authScreen">
      <section className="authPanel">
        <span className="stamp">СПУТНИК</span>
        <h1>Sputnik</h1>
        <p>{message}</p>
      </section>
    </main>
  )
}

function AuthGate({ profiles, onCreateProfile, onLogin, message, onMessage }) {
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id ?? '')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState(profiles.length ? 'login' : 'create')
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0]

  useEffect(() => {
    setMode(profiles.length ? 'login' : 'create')
    if (!selectedProfileId && profiles[0]) {
      setSelectedProfileId(profiles[0].id)
    }
  }, [profiles, profiles.length, selectedProfileId])

  async function submitLogin(event) {
    event.preventDefault()
    try {
      await onLogin({ profileId: selectedProfile.id, password })
      setPassword('')
    } catch (error) {
      onMessage(error.message)
    }
  }

  async function submitCreate(event) {
    event.preventDefault()
    try {
      await onCreateProfile({
        displayName,
        password,
        avatarKey: 'orbital-satellite'
      })
      setDisplayName('')
      setPassword('')
      setMode('login')
    } catch (error) {
      onMessage(error.message)
    }
  }

  return (
    <main className="authScreen">
      {message && (
        <button className="toast" onClick={() => onMessage('')}>
          {message}
        </button>
      )}
      <section className="authPanel">
        <div className="screenHeader">
          <div>
            <span className="stamp">КОМАНДА</span>
            <h1>Sputnik</h1>
            <p>Enter your local Mission OS profile.</p>
          </div>
        </div>

        {mode === 'login' && selectedProfile && (
          <form className="authForm" onSubmit={submitLogin}>
            <div className="profilePreview loginProfilePreview">
              <ProfileAvatar avatarKey={selectedProfile.avatar_key} size="large" />
              <div>
                <strong>{selectedProfile.display_name}</strong>
                <small>{selectedProfile.current_plan === 'pro' ? 'Sputnik Pro' : 'Free'}</small>
              </div>
            </div>
            {profiles.length > 1 && (
              <label>
                Profile
                <select
                  value={selectedProfile.id}
                  onChange={(event) => {
                    setSelectedProfileId(event.target.value)
                    setPassword('')
                  }}
                >
                  {profiles.map((profileItem) => (
                    <option key={profileItem.id} value={profileItem.id}>
                      {profileItem.display_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Password
              <input
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={`Enter ${selectedProfile.display_name}'s password`}
                type="password"
              />
            </label>
            <div className="actions">
              <button className="primaryButton" disabled={!password} type="submit">
                <Lock size={18} /> Enter
              </button>
              <button
                className="secondaryButton"
                type="button"
                onClick={() => {
                  setMode('create')
                  setPassword('')
                }}
              >
                <Plus size={18} /> Create Profile
              </button>
            </div>
          </form>
        )}

        {mode === 'create' && (
          <form className="authForm" onSubmit={submitCreate}>
            <div className="profilePreview">
              <ProfileAvatar avatarKey="orbital-satellite" size="large" />
              <div>
                <strong>Orbital Satellite</strong>
                <small>Free profile avatar</small>
              </div>
            </div>
            <label>
              Profile name
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Commander"
              />
            </label>
            <label>
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Local password"
                type="password"
              />
            </label>
            <div className="actions">
              <button className="primaryButton" disabled={!displayName.trim() || !password} type="submit">
                <Plus size={18} /> Create Profile
              </button>
              {profiles.length > 0 && (
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setDisplayName('')
                    setPassword('')
                  }}
                >
                  Back to Login
                </button>
              )}
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

function Dashboard({ stats, pet, missions, activity, onStartFocus, onNewMission }) {
  const [showFullTimeline, setShowFullTimeline] = useState(false)
  const compactTimelineCount = 3
  const hasMoreActivity = activity.length > compactTimelineCount
  const visibleActivity = showFullTimeline ? activity : activity.slice(0, compactTimelineCount)
  const isLaikaCelebrating = pet?.mood === 'celebrating'

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">КОСМОС</span>
          <h1>Good evening, Commander.</h1>
          <p>Plan. Focus. Stay in orbit.</p>
        </div>
        <div className="actions">
          <button className="primaryButton" onClick={onStartFocus}>
            <Play size={18} /> Start Focus
          </button>
          <button className="secondaryButton" onClick={onNewMission}>
            <Plus size={18} /> New Mission
          </button>
        </div>
      </div>

      <div className="metricGrid">
        <Metric label="Active missions" value={stats?.activeMissions ?? 0} />
        <Metric label="Focus minutes today" value={stats?.focusMinutesToday ?? 0} />
        <Metric label="Sessions today" value={stats?.completedSessionsToday ?? 0} />
        <Metric label="Current streak" value={`${stats?.currentStreak ?? 0}d`} />
      </div>

      <div className="dashboardGrid">
        <div className="dashboardColumn">
          <section className="panel">
            <h2>Mission Queue</h2>
            {missions.length === 0 ? (
              <EmptyState title="No missions yet" body="Create your first mission to start the demo flow." />
            ) : (
              <div className="list">
                {missions.slice(0, 4).map((mission) => (
                  <MissionRow key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </section>
          <section className="panel">
            <h2>Today Snapshot</h2>
            <div className="snapshotGrid">
              <Metric label="Tasks completed" value={stats?.completedTasksToday ?? 0} />
              <Metric label="Missions created" value={stats?.createdMissionsToday ?? 0} />
              <Metric label="Logs written" value={stats?.createdNotesToday ?? 0} />
            </div>
          </section>
        </div>
        <div className="dashboardColumn">
          <section className="panel">
            <h2>Mission Timeline</h2>
            {activity.length === 0 ? (
              <EmptyState title="No activity yet" body="Create a mission or complete a focus session to light up the ledger." />
            ) : (
              <>
                <ActivityList events={visibleActivity} />
                {hasMoreActivity && (
                  <button
                    className="secondaryButton timelineToggle"
                    onClick={() => setShowFullTimeline((current) => !current)}
                    type="button"
                  >
                    {showFullTimeline ? 'Show Less' : `Show ${activity.length - compactTimelineCount} More`}
                  </button>
                )}
              </>
            )}
          </section>
          <section className="panel companionPanel">
            <PetSprite pet={pet} animated={isLaikaCelebrating} mood={isLaikaCelebrating ? 'celebrating' : 'idle'} size="dock" />
            <h2>{pet?.name ?? 'Laika'} is {pet?.mood ?? 'ready'}.</h2>
            <p>Level {pet?.level ?? 1} · {pet?.xp ?? 0} XP · {pet?.skin_name ?? 'Classic Laika'}</p>
          </section>
        </div>
      </div>
    </section>
  )
}

function Missions({
  missions,
  selectedMissionId,
  onSelectMission,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onCreateTask,
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
  onCompleteMission,
  onStartFocus
}) {
  const [missionTitle, setMissionTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [editingMissionId, setEditingMissionId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const activeMission = missions.find((mission) => String(mission.id) === String(selectedMissionId))

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">АРХИВ</span>
          <h1>Missions</h1>
          <p>Create a mission, break it into tasks, then launch focus from here.</p>
        </div>
      </div>

      <form
        className="inlineForm"
        onSubmit={(event) => {
          event.preventDefault()
          onCreateMission({ title: missionTitle, description })
          setMissionTitle('')
          setDescription('')
        }}
      >
        <input value={missionTitle} onChange={(event) => setMissionTitle(event.target.value)} placeholder="Mission title" />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" />
        <button className="primaryButton" type="submit">
          <Plus size={18} /> Create
        </button>
      </form>

      <div className="twoColumn wideLeft">
        <section className="panel">
          <h2>Mission List</h2>
          {missions.length === 0 ? (
            <EmptyState title="No missions created" body="Your first mission becomes the anchor for tasks and focus sessions." />
          ) : (
            <div className="cardGrid">
              {missions.map((mission) => (
                <article
                  className={`missionCard ${String(mission.id) === String(selectedMissionId) ? 'selected' : ''}`}
                  key={mission.id}
                >
                  {editingMissionId === mission.id ? (
                    <MissionEditForm
                      mission={mission}
                      onCancel={() => setEditingMissionId(null)}
                      onSave={(data) => {
                        onUpdateMission(mission.id, data)
                        setEditingMissionId(null)
                      }}
                    />
                  ) : (
                    <>
                      <button className="cardSelectButton" onClick={() => onSelectMission(mission.id)}>
                        <span className="meta">{mission.priority} priority</span>
                        <h3>{mission.title}</h3>
                        <p>{mission.description || 'No description yet.'}</p>
                        <div className="progressBar">
                          <span style={{ width: `${mission.progress}%` }} />
                        </div>
                        <small>{mission.progress}% complete · {mission.total_focus_minutes} focus min</small>
                      </button>
                      <div className="cardActions">
                        <button className="iconButton" title="Edit mission" onClick={() => setEditingMissionId(mission.id)}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="iconButton danger"
                          title="Delete mission"
                          onClick={() => setConfirmDelete({ type: 'mission', id: mission.id, name: mission.title })}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>{activeMission ? activeMission.title : 'Mission Tasks'}</h2>
          {!activeMission ? (
            <EmptyState title="Select a mission" body="Tasks appear here once a mission is selected." />
          ) : (
            <>
              <form
                className="stackForm"
                onSubmit={(event) => {
                  event.preventDefault()
                  onCreateTask({ missionId: activeMission.id, title: taskTitle })
                  setTaskTitle('')
                }}
              >
                <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="New task" />
                <button className="secondaryButton" type="submit">
                  <Plus size={18} /> Add Task
                </button>
              </form>
              <div className="list taskList">
                {activeMission.tasks.map((task) => (
                  <div className="taskRow" key={task.id}>
                    {editingTaskId === task.id ? (
                      <TaskEditForm
                        task={task}
                        onCancel={() => setEditingTaskId(null)}
                        onSave={(data) => {
                          onUpdateTask(task.id, data)
                          setEditingTaskId(null)
                        }}
                      />
                    ) : (
                      <>
                        <button
                          className={`checkButton ${task.status === 'done' ? 'done' : ''}`}
                          onClick={() => {
                            if (task.status === 'done') {
                              onUpdateTask(task.id, { status: 'todo' })
                            } else {
                              onCompleteTask(task.id)
                            }
                          }}
                          title={task.status === 'done' ? 'Reopen task' : 'Complete task'}
                        >
                          <Check size={16} />
                        </button>
                        <div>
                          <strong>{task.title}</strong>
                          <small>{task.status} · {task.focus_minutes} focus min</small>
                        </div>
                        <div className="rowActions">
                          <button className="iconTextButton" onClick={() => onStartFocus(activeMission.id, task.id)}>
                            <Play size={16} /> Focus
                          </button>
                          <button className="iconButton" title="Edit task" onClick={() => setEditingTaskId(task.id)}>
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="iconButton danger"
                            title="Delete task"
                            onClick={() => setConfirmDelete({ type: 'task', id: task.id, name: task.title })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button className="primaryButton fullWidth" onClick={() => onStartFocus(activeMission.id)}>
                <Play size={18} /> Start Mission Focus
              </button>
              <button
                className="secondaryButton fullWidth"
                disabled={activeMission.status === 'completed'}
                onClick={() => onCompleteMission(activeMission.id)}
              >
                <Check size={18} /> Complete Mission
              </button>
            </>
          )}
        </section>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${confirmDelete.type}`}
          body={`Delete "${confirmDelete.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === 'mission') onDeleteMission(confirmDelete.id)
            if (confirmDelete.type === 'task') onDeleteTask(confirmDelete.id)
            setConfirmDelete(null)
          }}
        />
      )}
    </section>
  )
}

function MissionEditForm({ mission, onSave, onCancel }) {
  const [title, setTitle] = useState(mission.title)
  const [description, setDescription] = useState(mission.description ?? '')
  const [priority, setPriority] = useState(mission.priority ?? 'medium')
  const [status, setStatus] = useState(mission.status ?? 'active')
  const [dueDate, setDueDate] = useState(mission.due_date ?? '')

  return (
    <form
      className="stackForm"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ title, description, priority, status, dueDate: dueDate || null })
      }}
    >
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mission title" />
      <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" />
      <select value={priority} onChange={(event) => setPriority(event.target.value)}>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="planned">planned</option>
        <option value="active">active</option>
        <option value="completed">completed</option>
        <option value="archived">archived</option>
      </select>
      <input value={dueDate} onChange={(event) => setDueDate(event.target.value)} type="date" />
      <div className="actions">
        <button className="primaryButton" disabled={!title.trim()} type="submit">
          <Save size={16} /> Save
        </button>
        <button className="secondaryButton" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function TaskEditForm({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title)

  return (
    <form
      className="taskEditForm"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ title })
      }}
    >
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" />
      <button className="primaryButton" disabled={!title.trim()} type="submit">
        <Save size={16} /> Save
      </button>
      <button className="secondaryButton" type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="modalOverlay" role="presentation">
      <section className="modalPanel" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="actions">
          <button className="dangerButton" onClick={onConfirm}>
            <Trash2 size={16} /> {confirmLabel}
          </button>
          <button className="secondaryButton" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  )
}

function Focus({
  missions,
  pet,
  selectedMissionId,
  selectedTaskId,
  selectedMission,
  selectedTask,
  settings,
  timer,
  onSelectMission,
  onSelectTask,
  onStartPause,
  onReset,
  onComplete
}) {
  useEffect(() => {
    function handleShortcut(event) {
      if (event.target?.matches?.('input, select, textarea')) return

      if (event.code === 'Space') {
        event.preventDefault()
        onStartPause()
      }

      if (event.key.toLowerCase() === 's') {
        onStartPause()
      }

      if (event.key.toLowerCase() === 'r') {
        onReset()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [onReset, onStartPause])

  const plannedMinutes = Number(timer.plannedMinutes ?? settings.focus_minutes ?? 25)
  const secondsLeft = timer.secondsLeft
  const status = timer.status
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')
  const progress = plannedMinutes > 0
    ? 100 - (secondsLeft / (plannedMinutes * 60)) * 100
    : 0

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ЗАПУСК</span>
          <h1>Focus</h1>
          <p>Every Pomodoro should know what mission it is pushing forward.</p>
        </div>
      </div>

      <div className="focusGrid">
        <section className="panel timerPanel">
          <div className="selectorRow">
            <label>
              Mission
              <select value={selectedMissionId} onChange={(event) => onSelectMission(event.target.value)}>
                <option value="">Quick focus</option>
                {missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>{mission.title}</option>
                ))}
              </select>
            </label>
            <label>
              Task
              <select value={selectedTaskId} onChange={(event) => onSelectTask(event.target.value)} disabled={!selectedMission}>
                <option value="">No task selected</option>
                {selectedMission?.tasks?.map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="timerReadout">{minutes}:{seconds}</div>
          <div className="sessionLine">
            {selectedMission ? selectedMission.title : 'Quick focus'} {selectedTask ? `· ${selectedTask.title}` : ''}
          </div>
          <div className="progressBar large">
            <span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
          </div>
          <div className="actions center">
            <button className="primaryButton" onClick={onStartPause}>
              <Play size={18} /> {status === 'running' ? 'Pause' : 'Start'}
            </button>
            <button className="secondaryButton" onClick={onReset}>
              <RefreshCw size={18} /> Reset
            </button>
            <button className="secondaryButton" onClick={onComplete}>
              <Check size={18} /> Complete Session
            </button>
          </div>
        </section>

        <section className="panel companionPanel">
          <PetSprite pet={pet} animated={status !== 'ready'} mood={status === 'ready' ? 'idle' : status} size="focus" />
          <h2>{status === 'running' ? 'Laika is focusing.' : 'Laika is ready.'}</h2>
          <p>Status: {status}. Completion now grants XP and checks achievements.</p>
        </section>
      </div>
    </section>
  )
}

function CrewLog({ notes, missions, onCreateNote, onUpdateNote, onDeleteNote }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [missionId, setMissionId] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [composerError, setComposerError] = useState('')

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ЖУРНАЛ</span>
          <h1>Crew Log</h1>
          <p>Capture useful notes while the mission is still warm.</p>
        </div>
      </div>
      <form
        className="noteComposer"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!title.trim()) {
            setComposerError('Add a log title before saving.')
            return
          }
          setComposerError('')
          const saved = await onCreateNote({ title, body, missionId: missionId || null })
          if (saved) {
            setTitle('')
            setBody('')
          }
        }}
      >
        <input
          aria-invalid={Boolean(composerError)}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (composerError && event.target.value.trim()) setComposerError('')
          }}
          placeholder="Log title"
        />
        {composerError && <p className="formHint error">{composerError}</p>}
        <select value={missionId} onChange={(event) => setMissionId(event.target.value)}>
          <option value="">No mission</option>
          {missions.map((mission) => (
            <option key={mission.id} value={mission.id}>{mission.title}</option>
          ))}
        </select>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the log entry..." />
        <button className="primaryButton" disabled={!title.trim()} type="submit">
          <Plus size={18} /> Save Log
        </button>
      </form>
      <div className="list">
        {notes.map((note) => (
          <article className="logEntry" key={note.id}>
            {editingNoteId === note.id ? (
              <NoteEditForm
                note={note}
                missions={missions}
                onCancel={() => setEditingNoteId(null)}
                onSave={(data) => {
                  onUpdateNote(note.id, data)
                  setEditingNoteId(null)
                }}
              />
            ) : (
              <>
                <span className="meta">{note.mission_title || 'General'}</span>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
                <div className="cardActions">
                  <button className="iconButton" title="Edit log" onClick={() => setEditingNoteId(note.id)}>
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="iconButton danger"
                    title="Delete log"
                    onClick={() => setConfirmDelete({ id: note.id, name: note.title })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Crew Log"
          body={`Delete "${confirmDelete.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onDeleteNote(confirmDelete.id)
            setConfirmDelete(null)
          }}
        />
      )}
    </section>
  )
}

function NoteEditForm({ note, missions, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)
  const [missionId, setMissionId] = useState(note.mission_id ? String(note.mission_id) : '')
  const [formError, setFormError] = useState('')

  return (
    <form
      className="noteComposer compact"
      onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim()) {
          setFormError('Add a log title before saving.')
          return
        }
        setFormError('')
        onSave({ title, body, missionId: missionId || null })
      }}
    >
      <input
        aria-invalid={Boolean(formError)}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
          if (formError && event.target.value.trim()) setFormError('')
        }}
        placeholder="Log title"
      />
      {formError && <p className="formHint error">{formError}</p>}
      <select value={missionId} onChange={(event) => setMissionId(event.target.value)}>
        <option value="">No mission</option>
        {missions.map((mission) => (
          <option key={mission.id} value={mission.id}>{mission.title}</option>
        ))}
      </select>
      <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the log entry..." />
      <div className="actions">
        <button className="primaryButton" disabled={!title.trim()} type="submit">
          <Save size={16} /> Save
        </button>
        <button className="secondaryButton" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function Stats({ stats, missions, weeklyStats }) {
  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ТЕЛЕМЕТРИЯ</span>
          <h1>Stats</h1>
          <p>Mission OS telemetry is updated by workflows and daily snapshots.</p>
        </div>
      </div>
      <div className="metricGrid">
        <Metric label="Total focus minutes" value={stats?.totalFocusMinutes ?? 0} />
        <Metric label="Total sessions" value={stats?.totalFocusSessions ?? 0} />
        <Metric label="Missions created" value={missions.length} />
        <Metric label="Current streak" value={`${stats?.currentStreak ?? 0}d`} />
      </div>
      <div className="twoColumn">
        <section className="panel">
          <h2>Weekly Focus</h2>
          {weeklyStats.length === 0 ? (
            <EmptyState title="No weekly telemetry yet" body="Complete a focus session to create the first daily snapshot." />
          ) : (
            <div className="weeklyBars">
              {weeklyStats.map((item) => (
                <div className="weeklyBar" key={item.day}>
                  <span>{item.day}</span>
                  <div className="progressBar">
                    <span style={{ width: `${Math.min(100, (item.minutes / 120) * 100)}%` }} />
                  </div>
                  <strong>{item.minutes} min</strong>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="panel">
          <h2>Recent Activity</h2>
          {stats?.recentActivity?.length ? (
            <ActivityList events={stats.recentActivity} />
          ) : (
            <EmptyState title="No activity yet" body="Mission OS events will appear here after user actions." />
          )}
        </section>
      </div>
    </section>
  )
}

function Achievements({ achievements }) {
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">НАГРАДЫ</span>
          <h1>Achievements</h1>
          <p>Unlocked by real mission, focus, task, log, and Pro simulation events.</p>
        </div>
        <Metric label="Unlocked" value={`${unlockedCount}/${achievements.length}`} />
      </div>
      <div className="achievementGrid">
        {achievements.map((achievement) => {
          const percent = Math.min(100, (achievement.progress / achievement.target) * 100)
          return (
            <article className={`achievementCard ${achievement.unlocked ? 'unlocked' : ''}`} key={achievement.id}>
              <Trophy size={22} />
              <div>
                <span className="meta">{achievement.unlocked ? 'Unlocked' : 'In progress'}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <div className="progressBar">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <small>{Math.min(achievement.progress, achievement.target)} / {achievement.target}</small>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Companion({ pet, skins, onSelectSkin }) {
  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ЛАЙКА</span>
          <h1>Companion</h1>
          <p>Laika grows with completed work and can wear unlocked mission-control skins.</p>
        </div>
      </div>
      <div className="twoColumn">
        <section className="panel companionPanel largeCompanion">
          <PetSprite pet={pet} mood={pet?.mood === 'celebrating' ? 'celebrating' : 'happy'} size="stage" />
          <h2>{pet?.name ?? 'Laika'}</h2>
          <p>Level {pet?.level ?? 1} · {pet?.xp ?? 0} XP · mood: {pet?.mood ?? 'ready'}</p>
          <div className="progressBar companionProgress">
            <span style={{ width: `${pet?.progress_to_next_level ?? 0}%` }} />
          </div>
          <small>Next level at {pet?.next_level_xp ?? 100} XP</small>
        </section>
        <section className="panel">
          <h2>Skins</h2>
          <div className="skinGrid">
            {skins.map((skin) => (
              <button
                className={`skinCard ${pet?.current_skin_id === skin.id ? 'selected' : ''}`}
                key={skin.id}
                disabled={skin.locked}
                onClick={() => onSelectSkin(skin.id)}
              >
                <span className={`skinSwatch ${skin.palette}`} />
                <strong>{skin.name}</strong>
                <small>{skin.locked ? 'Requires Pro simulation' : skin.is_premium ? 'Premium' : 'Unlocked'}</small>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function renderInlineMarkdown(text) {
  return String(text).split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

function KosmoMarkdown({ children }) {
  const blocks = String(children ?? '').split(/\n{2,}/)
  return (
    <div className="kosmoMarkdown">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter(Boolean)
        const bulletLines = lines.filter((line) => /^[-*]\s+/.test(line.trim()))

        if (bulletLines.length === lines.length && lines.length > 0) {
          return (
            <ul key={blockIndex}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.trim().replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {renderInlineMarkdown(line)}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function KosmoAI() {
  const starterPrompts = [
    'Break down my current mission',
    'Quiz me from my Crew Log',
    'Plan my next focus session'
  ]
  const [status, setStatus] = useState({ configured: false, source: null, encryptionAvailable: false })
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadKosmo() {
    try {
      const [nextStatus, nextSessions] = await Promise.all([
        api.mentor.getStatus(),
        api.mentor.listSessions()
      ])
      setStatus(nextStatus)
      setSessions(nextSessions)
      if (!activeSessionId && nextSessions[0]) {
        const saved = await api.mentor.getSession(nextSessions[0].id)
        setActiveSessionId(saved.session.id)
        setMessages(saved.messages)
      }
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  useEffect(() => {
    loadKosmo()
  }, [])

  async function openSession(id) {
    setError('')
    try {
      const saved = await api.mentor.getSession(id)
      setActiveSessionId(saved.session.id)
      setMessages(saved.messages)
      if (saved.usage) setStatus((current) => ({ ...current, usage: saved.usage }))
    } catch (openError) {
      setError(openError.message)
    }
  }

  async function startNewSession() {
    setError('')
    try {
      const created = await api.mentor.createSession({ title: 'New Kosmo session' })
      setActiveSessionId(created.session.id)
      setMessages(created.messages)
      setSessions(await api.mentor.listSessions())
    } catch (createError) {
      setError(createError.message)
    }
  }

  async function deleteActiveSession() {
    if (!activeSessionId) return
    setError('')
    try {
      const nextSessions = await api.mentor.deleteSession(activeSessionId)
      setSessions(nextSessions)
      if (nextSessions[0]) {
        await openSession(nextSessions[0].id)
      } else {
        setActiveSessionId(null)
        setMessages([])
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function sendText(text) {
    const content = text.trim()
    if (!content || busy) return

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setDraft('')
    setBusy(true)
    setError('')

    try {
      const result = await api.mentor.sendMessage({ sessionId: activeSessionId, content })
      setActiveSessionId(result.session.id)
      setMessages(result.messages)
      setStatus((current) => ({ ...current, usage: result.usage }))
      setSessions(await api.mentor.listSessions())
    } catch (sendError) {
      setError(sendError.message)
    } finally {
      setBusy(false)
    }
  }

  const configuredLabel = status.configured
    ? 'Kosmo AI ready'
    : 'Kosmo AI is offline on this device'
  const usage = status.usage ?? { plan: 'free', limit: 10, used: 0, remaining: 10 }
  const limitReached = usage.limit !== null && usage.remaining <= 0
  const canSend = status.configured && !busy && !limitReached

  return (
    <section className="screen kosmoScreen">
      <div className="screenHeader">
        <div>
          <span className="stamp">КОСМО</span>
          <h1>Kosmo AI</h1>
          <p>
            {configuredLabel}
            {' · '}
            {usage.limit === null ? 'Pro unlimited' : `${usage.remaining} free messages left today`}
          </p>
        </div>
        <div className="actions">
          <button className="secondaryButton" onClick={startNewSession} type="button">
            <Plus size={18} /> New Chat
          </button>
          <button className="secondaryButton" disabled={!activeSessionId} onClick={deleteActiveSession} type="button">
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="kosmoGrid">
        <section className="panel kosmoChatPanel">
          <div className="kosmoMessages" aria-live="polite">
            {messages.length === 0 ? (
              <div className="emptyState">
                <strong>Kosmo AI is standing by.</strong>
                <p>Pick a starter or send your own signal.</p>
              </div>
            ) : (
              messages.map((item, index) => (
                <article className={`kosmoBubble ${item.role}`} key={`${item.role}-${index}`}>
                  <strong>{item.role === 'assistant' ? 'Kosmo AI' : 'You'}</strong>
                  <KosmoMarkdown>{item.content}</KosmoMarkdown>
                </article>
              ))
            )}
            {busy && (
              <article className="kosmoBubble assistant">
                <strong>Kosmo AI</strong>
                <KosmoMarkdown>Thinking...</KosmoMarkdown>
              </article>
            )}
          </div>

          <div className="kosmoStarters">
            {starterPrompts.map((prompt) => (
              <button
                className="iconTextButton"
                disabled={!canSend}
                key={prompt}
                onClick={() => sendText(prompt)}
                type="button"
              >
                <Sparkles size={16} /> {prompt}
              </button>
            ))}
          </div>

          <form
            className="kosmoComposer"
            onSubmit={(event) => {
              event.preventDefault()
              sendText(draft)
            }}
          >
            <textarea
              disabled={!canSend}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={limitReached ? 'Free limit reached for today' : 'Ask Kosmo AI...'}
              value={draft}
            />
            <button className="primaryButton" disabled={!canSend || !draft.trim()}>
              <Send size={18} /> Send
            </button>
          </form>
          {error && <pre className="kosmoError">{error}</pre>}
        </section>

        <section className="panel kosmoSessionsPanel">
          <PanelTitle icon={Bot} title="Sessions" />
          <p>{usage.limit === null ? 'Sputnik Pro removes daily chat limits.' : `${usage.used} / ${usage.limit} messages used today.`}</p>
          <div className="kosmoSessionList">
            {sessions.length === 0 ? (
              <div className="emptyState">
                <strong>No saved chats yet.</strong>
                <p>Your next message starts one.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  className={`kosmoSessionButton ${activeSessionId === session.id ? 'active' : ''}`}
                  key={session.id}
                  onClick={() => openSession(session.id)}
                  type="button"
                >
                  <strong>{session.title}</strong>
                  <small>{session.messageCount} messages</small>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

function ProSimulation({ profile, skins, themes, onActivate }) {
  const isPro = profile?.current_plan === 'pro'
  const premiumSkins = skins.filter((skin) => skin.is_premium)
  const premiumThemes = themes.filter((theme) => theme.isPremium)
  const proBenefits = [
    {
      title: 'Unlimited Kosmo AI',
      body: 'Remove the daily Free message limit for planning, studying, and mission coaching.'
    },
    {
      title: 'Premium Laika skins',
      body: 'Unlock the premium companion looks and keep them available in Companion.'
    },
    {
      title: 'Premium workspace themes',
      body: 'Unlock alternate command-center looks for focus, planning, and companion screens.'
    },
    {
      title: 'Pro achievement',
      body: 'Mark the profile as a Sputnik Pro simulation workspace.'
    }
  ]

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ГОТОВО</span>
          <h1>Sputnik Pro</h1>
          <p>Offline simulation only. It unlocks premium Laika skins, Kosmo AI unlimited, and a Pro achievement.</p>
        </div>
        <button className="primaryButton" disabled={isPro} onClick={onActivate}>
          <Crown size={18} /> {isPro ? 'Simulation Active' : 'Activate Simulation'}
        </button>
      </div>
      <div className="cardGrid proBenefitGrid">
        {proBenefits.map((benefit) => (
          <article className="missionCard" key={benefit.title}>
            <span className="stamp">PRO</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.body}</p>
          </article>
        ))}
      </div>
      <div className="cardGrid">
        {premiumSkins.map((skin) => (
          <article className="missionCard" key={skin.id}>
            <span className={`skinSwatch ${skin.palette}`} />
            <h3>{skin.name}</h3>
            <p>{isPro ? 'Available in Companion.' : 'Locked until Sputnik Pro simulation is active.'}</p>
          </article>
        ))}
      </div>
      <div className="cardGrid proThemeGrid">
        {premiumThemes.map((theme) => (
          <article className="missionCard themeCard" key={theme.key}>
            <ThemeSwatches swatches={theme.swatches} />
            <h3>{theme.name}</h3>
            <p>{isPro ? 'Available in Settings.' : 'Locked until Sputnik Pro simulation is active.'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SettingsPanel({
  settings,
  themes,
  profile,
  onSaveSetting,
  onUpdateProfile,
  onChangePassword,
  onLogout,
  onDeleteProfile
}) {
  const [focusMinutes, setFocusMinutes] = useState(String(settings.focus_minutes ?? 25))
  const [shortBreakMinutes, setShortBreakMinutes] = useState(String(settings.short_break_minutes ?? 5))
  const [longBreakMinutes, setLongBreakMinutes] = useState(String(settings.long_break_minutes ?? 15))
  const [displayName, setDisplayName] = useState(profile?.display_name ?? 'Commander')
  const [avatarKey, setAvatarKey] = useState(profile?.avatar_key ?? 'orbital-satellite')
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [mentorStatus, setMentorStatus] = useState({ configured: false, source: null, encryptionAvailable: true })
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [mentorSaving, setMentorSaving] = useState(false)
  const [mentorMessage, setMentorMessage] = useState('')

  useEffect(() => {
    setFocusMinutes(String(settings.focus_minutes ?? 25))
    setShortBreakMinutes(String(settings.short_break_minutes ?? 5))
    setLongBreakMinutes(String(settings.long_break_minutes ?? 15))
  }, [settings.focus_minutes, settings.short_break_minutes, settings.long_break_minutes])

  useEffect(() => {
    setDisplayName(profile?.display_name ?? 'Commander')
    setAvatarKey(profile?.avatar_key ?? 'orbital-satellite')
  }, [profile?.display_name, profile?.avatar_key])

  useEffect(() => {
    async function loadMentorStatus() {
      try {
        setMentorStatus(await api.mentor.getStatus())
      } catch (error) {
        setMentorMessage(getFriendlyErrorMessage(error.message))
      }
    }

    loadMentorStatus()
  }, [])

  async function saveGeminiKey() {
    setMentorSaving(true)
    setMentorMessage('')
    try {
      setMentorStatus(await api.mentor.saveApiKey(geminiApiKey))
      setGeminiApiKey('')
      setShowApiKeyForm(false)
      setMentorMessage('API key saved.')
    } catch (error) {
      setMentorMessage(getFriendlyErrorMessage(error.message))
    } finally {
      setMentorSaving(false)
    }
  }

  async function clearGeminiKey() {
    setMentorSaving(true)
    setMentorMessage('')
    try {
      setMentorStatus(await api.mentor.clearApiKey())
      setMentorMessage('Saved API key deleted.')
    } catch (error) {
      setMentorMessage(getFriendlyErrorMessage(error.message))
    } finally {
      setMentorSaving(false)
    }
  }

  const focusValid = isValidMinuteValue(focusMinutes, 1, 120)
  const shortValid = isValidMinuteValue(shortBreakMinutes, 1, 30)
  const longValid = isValidMinuteValue(longBreakMinutes, 1, 60)
  const settingsValid = focusValid && shortValid && longValid
  const isPro = profile?.current_plan === 'pro'
  const selectedThemeKey = getThemeKey(settings.app_theme)
  const mentorStatusLabel = mentorStatus.configured
    ? mentorStatus.source === 'saved'
      ? 'API key saved'
      : 'API key ready'
    : 'No API key configured'

  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ПУЛЬТ</span>
          <h1>Settings</h1>
          <p>Focus defaults are stored locally in SQLite.</p>
        </div>
      </div>
      <div className="settingsGrid">
        <section className="panel settingsPanel">
          <PanelTitle icon={TimerReset} title="Focus" />
          <NumberStepper
            label="Focus minutes"
            max={120}
            min={1}
            value={focusMinutes}
            onChange={setFocusMinutes}
          />
          <NumberStepper
            label="Short break"
            max={30}
            min={1}
            value={shortBreakMinutes}
            onChange={setShortBreakMinutes}
          />
          <NumberStepper
            label="Long break"
            max={60}
            min={1}
            value={longBreakMinutes}
            onChange={setLongBreakMinutes}
          />
          <button
            className="primaryButton"
            disabled={!settingsValid}
            onClick={async () => {
              await onSaveSetting('focus_minutes', Number(focusMinutes))
              await onSaveSetting('short_break_minutes', Number(shortBreakMinutes))
              await onSaveSetting('long_break_minutes', Number(longBreakMinutes))
            }}
          >
            <Save size={18} /> Save Focus Defaults
          </button>
        </section>

        <section className="panel settingsPanel">
          <PanelTitle icon={User} title="Profile" />
          <label>
            Profile name
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <button
            className="primaryButton"
            disabled={!displayName.trim()}
            onClick={() => onUpdateProfile({ displayName, avatarKey })}
          >
            <Save size={18} /> Save Profile
          </button>
          <div className="divider" />
          <label>
            Current password
            <input
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
            />
          </label>
          <label>
            New password
            <input
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              type="password"
            />
          </label>
          <button
            className="secondaryButton"
            disabled={!currentPassword || !nextPassword}
            onClick={() => {
              onChangePassword({ currentPassword, nextPassword })
              setCurrentPassword('')
              setNextPassword('')
            }}
          >
            <Shield size={18} /> Change Password
          </button>
        </section>

        <section className="panel settingsPanel">
          <PanelTitle icon={PawPrint} title="Appearance" />
          <div className="avatarChoiceGrid">
            {PROFILE_AVATARS.map((avatar) => {
              const locked = avatar.isPremium && !isPro
              return (
                <button
                  className={`avatarChoice ${avatarKey === avatar.key ? 'selected' : ''}`}
                  disabled={locked}
                  key={avatar.key}
                  onClick={() => {
                    setAvatarKey(avatar.key)
                    onUpdateProfile({ displayName, avatarKey: avatar.key })
                  }}
                >
                  <ProfileAvatar avatarKey={avatar.key} size="medium" />
                  <strong>{avatar.name}</strong>
                  <small>{locked ? 'Requires Sputnik Pro' : avatar.isPremium ? 'Sputnik Pro' : 'Free'}</small>
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel settingsPanel">
          <PanelTitle icon={Palette} title="Theme" />
          <div className="themeChoiceGrid">
            {themes.map((theme) => {
              const locked = theme.isPremium && !isPro
              return (
                <button
                  className={`themeChoice ${selectedThemeKey === theme.key ? 'selected' : ''}`}
                  disabled={locked}
                  key={theme.key}
                  onClick={() => onSaveSetting('app_theme', theme.key)}
                  type="button"
                >
                  <ThemeSwatches swatches={theme.swatches} />
                  <strong>{theme.name}</strong>
                  <span>{theme.description}</span>
                  <small>{locked ? 'Requires Sputnik Pro' : theme.isPremium ? 'Sputnik Pro' : 'Free'}</small>
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel settingsPanel kosmoSettingsPanel">
          <div className="settingsPanelHeader">
            <PanelTitle icon={Bot} title="Kosmo AI" />
            <span className={`statusPill ${mentorStatus.configured ? 'ready' : ''}`}>
              {mentorStatusLabel}
            </span>
          </div>
          <p>Connect a local API key for mission coaching, note review, and study prompts.</p>
          {showApiKeyForm && (
            <>
              <label>
                API key
                <input
                  autoComplete="off"
                  onChange={(event) => setGeminiApiKey(event.target.value)}
                  placeholder="Paste API key"
                  type="password"
                  value={geminiApiKey}
                />
              </label>
              <div className="actions">
                <button
                  className="primaryButton"
                  disabled={!geminiApiKey.trim() || mentorSaving}
                  onClick={saveGeminiKey}
                  type="button"
                >
                  <Save size={18} /> Save Key
                </button>
                <button
                  className="secondaryButton"
                  onClick={() => {
                    setShowApiKeyForm(false)
                    setGeminiApiKey('')
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          {!showApiKeyForm && mentorStatus.source !== 'saved' && (
            <button className="secondaryButton" onClick={() => setShowApiKeyForm(true)} type="button">
              <Plus size={18} /> Add API Key
            </button>
          )}
          {!showApiKeyForm && mentorStatus.source === 'saved' && (
            <button
              className="secondaryButton"
              disabled={mentorSaving}
              onClick={clearGeminiKey}
              type="button"
            >
              <Trash2 size={18} /> Delete API Key
            </button>
          )}
          {!mentorStatus.encryptionAvailable && (
            <p>Secure local key storage is unavailable on this device.</p>
          )}
          {mentorMessage && <pre>{mentorMessage}</pre>}
        </section>

        <section className="panel settingsPanel">
          <PanelTitle icon={Database} title="Data" />
          <p>Close the current profile and return to login. Your local data stays saved.</p>
          <button className="secondaryButton" type="button" onClick={onLogout}>
            <Lock size={18} /> Sign Out
          </button>
          <div className="divider" />
          <label>
            Password
            <input
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Required to delete profile"
              type="password"
            />
          </label>
          <button className="dangerButton" disabled={!deletePassword} onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} /> Delete Profile
          </button>
        </section>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Delete profile"
          body={`Delete "${profile.display_name}" and its local Sputnik data? This cannot be undone.`}
          confirmLabel="Delete Profile"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            onDeleteProfile({ password: deletePassword })
            setDeletePassword('')
            setConfirmDelete(false)
          }}
        />
      )}
    </section>
  )
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="panelTitle">
      <Icon size={18} />
      <h2>{title}</h2>
    </div>
  )
}

function ThemeSwatches({ swatches }) {
  return (
    <span className="themeSwatches" aria-hidden="true">
      {swatches.map((swatch) => (
        <span key={swatch} style={{ background: swatch }} />
      ))}
    </span>
  )
}

function NumberStepper({ label, value, min, max, onChange }) {
  const valid = isValidMinuteValue(value, min, max)

  function update(nextValue) {
    if (nextValue === '' || /^\d+$/.test(nextValue)) {
      onChange(nextValue)
    }
  }

  return (
    <label className="numberControl">
      {label}
      <div className={`stepper ${valid ? '' : 'invalid'}`.trim()}>
        <button
          className="iconButton"
          type="button"
          onClick={() => onChange(String(Math.max(min, Number(value || min) - 1)))}
        >
          <Minus size={16} />
        </button>
        <input
          inputMode="numeric"
          max={max}
          min={min}
          step="1"
          type="number"
          value={value}
          onChange={(event) => update(event.target.value)}
        />
        <button
          className="iconButton"
          type="button"
          onClick={() => onChange(String(Math.min(max, Number(value || min) + 1)))}
        >
          <Plus size={16} />
        </button>
      </div>
      {!valid && <small>Use a whole number from {min} to {max}.</small>}
    </label>
  )
}

function isValidMinuteValue(value, min, max) {
  if (!/^\d+$/.test(String(value))) return false
  const numberValue = Number(value)
  return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max
}

function Metric({ label, value }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  )
}

function ActivityList({ events }) {
  return (
    <div className="activityList">
      {events.map((event) => (
        <article className="activityItem" key={event.id}>
          <span className="activityDot" />
          <div>
            <strong>{event.title}</strong>
            <small>
              {event.event_type} {event.mission_title ? `· ${event.mission_title}` : ''} · {formatDate(event.created_at)}
            </small>
          </div>
        </article>
      ))}
    </div>
  )
}

function formatDate(value) {
  if (!value) return 'just now'
  return new Date(value.replace(' ', 'T')).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function MissionRow({ mission }) {
  return (
    <div className="missionRow">
      <Gauge size={18} />
      <div>
        <strong>{mission.title}</strong>
        <small>{mission.progress}% complete · {mission.total_focus_minutes} focus min</small>
      </div>
    </div>
  )
}
