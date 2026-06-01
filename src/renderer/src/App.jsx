import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Check,
  ClipboardList,
  Crown,
  Gauge,
  Home,
  NotebookText,
  PawPrint,
  Play,
  Plus,
  RefreshCw,
  Settings,
  TimerReset
} from 'lucide-react'
import { AppLayout } from './app/layout/AppLayout.jsx'
import { EmptyState } from './shared/components/EmptyState.jsx'

const api = window.sputnik

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'missions', label: 'Missions', icon: ClipboardList },
  { id: 'focus', label: 'Focus', icon: TimerReset },
  { id: 'notes', label: 'Crew Log', icon: NotebookText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'companion', label: 'Companion', icon: PawPrint },
  { id: 'pro', label: 'Sputnik Pro', icon: Crown },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export function App() {
  const [view, setView] = useState('dashboard')
  const [missions, setMissions] = useState([])
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState(null)
  const [pet, setPet] = useState(null)
  const [settings, setSettings] = useState({})
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [message, setMessage] = useState('')

  async function refresh() {
    const [missionData, noteData, statData, petData, settingData] = await Promise.all([
      api.missions.getAll(),
      api.notes.getAll(),
      api.stats.getDashboard(),
      api.pets.getCurrent(),
      api.settings.getAll()
    ])
    setMissions(missionData)
    setNotes(noteData)
    setStats(statData)
    setPet(petData)
    setSettings(settingData)

    if (!selectedMissionId && missionData[0]) {
      setSelectedMissionId(String(missionData[0].id))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const selectedMission = useMemo(
    () => missions.find((mission) => String(mission.id) === String(selectedMissionId)),
    [missions, selectedMissionId]
  )

  const selectedTask = useMemo(
    () => selectedMission?.tasks?.find((task) => String(task.id) === String(selectedTaskId)),
    [selectedMission, selectedTaskId]
  )

  async function runAction(action, successMessage) {
    try {
      await action()
      await refresh()
      setMessage(successMessage)
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <AppLayout
      navItems={navItems}
      currentView={view}
      onNavigate={setView}
      activeMission={selectedMission}
      pet={pet}
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
          onCreateTask={(data) => runAction(() => api.tasks.create(data), 'Task added.')}
          onCompleteTask={(id) => runAction(() => api.tasks.complete(id), 'Task completed.')}
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
          selectedMissionId={selectedMissionId}
          selectedTaskId={selectedTaskId}
          selectedMission={selectedMission}
          selectedTask={selectedTask}
          settings={settings}
          onSelectMission={(id) => {
            setSelectedMissionId(String(id))
            setSelectedTaskId('')
          }}
          onSelectTask={(id) => setSelectedTaskId(String(id))}
          onComplete={(data) =>
            runAction(() => api.focus.completeSession(data), 'Focus session saved.')
          }
        />
      )}

      {view === 'notes' && (
        <CrewLog
          notes={notes}
          missions={missions}
          onCreateNote={(data) => runAction(() => api.notes.create(data), 'Crew log saved.')}
        />
      )}

      {view === 'stats' && <Stats stats={stats} missions={missions} />}
      {view === 'companion' && <Companion pet={pet} />}
      {view === 'pro' && (
        <ProSimulation
          onActivate={() => runAction(() => api.pro.activateSimulation(), 'Sputnik Pro simulation activated.')}
        />
      )}
      {view === 'settings' && <SettingsPanel settings={settings} />}
    </AppLayout>
  )
}

function Dashboard({ stats, pet, missions, onStartFocus, onNewMission }) {
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
        <Metric label="Laika mood" value={pet?.mood ?? 'ready'} />
      </div>

      <div className="twoColumn">
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
        <section className="panel companionPanel">
          <div className="laika">▟◕ᴥ◕▙</div>
          <h2>Laika is on standby.</h2>
          <p>Complete a focus session and Laika will celebrate the progress.</p>
        </section>
      </div>
    </section>
  )
}

function Missions({
  missions,
  selectedMissionId,
  onSelectMission,
  onCreateMission,
  onCreateTask,
  onCompleteTask,
  onStartFocus
}) {
  const [missionTitle, setMissionTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
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
                <button
                  className={`missionCard ${String(mission.id) === String(selectedMissionId) ? 'selected' : ''}`}
                  key={mission.id}
                  onClick={() => onSelectMission(mission.id)}
                >
                  <span className="meta">{mission.priority} priority</span>
                  <h3>{mission.title}</h3>
                  <p>{mission.description || 'No description yet.'}</p>
                  <div className="progressBar">
                    <span style={{ width: `${mission.progress}%` }} />
                  </div>
                  <small>{mission.progress}% complete · {mission.total_focus_minutes} focus min</small>
                </button>
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
              <div className="list">
                {activeMission.tasks.map((task) => (
                  <div className="taskRow" key={task.id}>
                    <button
                      className={`checkButton ${task.status === 'done' ? 'done' : ''}`}
                      onClick={() => onCompleteTask(task.id)}
                      title="Complete task"
                    >
                      <Check size={16} />
                    </button>
                    <div>
                      <strong>{task.title}</strong>
                      <small>{task.status} · {task.focus_minutes} focus min</small>
                    </div>
                    <button className="iconTextButton" onClick={() => onStartFocus(activeMission.id, task.id)}>
                      <Play size={16} /> Focus
                    </button>
                  </div>
                ))}
              </div>
              <button className="primaryButton fullWidth" onClick={() => onStartFocus(activeMission.id)}>
                <Play size={18} /> Start Mission Focus
              </button>
            </>
          )}
        </section>
      </div>
    </section>
  )
}

function Focus({
  missions,
  selectedMissionId,
  selectedTaskId,
  selectedMission,
  selectedTask,
  settings,
  onSelectMission,
  onSelectTask,
  onComplete
}) {
  const plannedMinutes = Number(settings.focus_minutes ?? 25)
  const [secondsLeft, setSecondsLeft] = useState(plannedMinutes * 60)
  const [status, setStatus] = useState('ready')

  useEffect(() => {
    setSecondsLeft(plannedMinutes * 60)
  }, [plannedMinutes])

  useEffect(() => {
    if (status !== 'running') return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    if (secondsLeft === 0 && status === 'running') {
      setStatus('completed')
    }
  }, [secondsLeft, status])

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  async function completeNow() {
    await onComplete({
      missionId: selectedMission?.id ?? null,
      taskId: selectedTask?.id ?? null,
      mode: 'focus',
      plannedMinutes,
      actualMinutes: plannedMinutes
    })
    setStatus('completed')
  }

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
            <span style={{ width: `${100 - (secondsLeft / (plannedMinutes * 60)) * 100}%` }} />
          </div>
          <div className="actions center">
            <button className="primaryButton" onClick={() => setStatus(status === 'running' ? 'paused' : 'running')}>
              <Play size={18} /> {status === 'running' ? 'Pause' : 'Start'}
            </button>
            <button className="secondaryButton" onClick={() => setSecondsLeft(plannedMinutes * 60)}>
              <RefreshCw size={18} /> Reset
            </button>
            <button className="secondaryButton" onClick={completeNow}>
              <Check size={18} /> Complete Session
            </button>
          </div>
        </section>

        <section className="panel companionPanel">
          <div className={`laika ${status}`}>▟◕ᴥ◕▙</div>
          <h2>{status === 'running' ? 'Laika is focusing.' : 'Laika is ready.'}</h2>
          <p>Status: {status}. Use this screen to save real focus minutes into the selected mission.</p>
        </section>
      </div>
    </section>
  )
}

function CrewLog({ notes, missions, onCreateNote }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [missionId, setMissionId] = useState('')

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
        onSubmit={(event) => {
          event.preventDefault()
          onCreateNote({ title, body, missionId: missionId || null })
          setTitle('')
          setBody('')
        }}
      >
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Log title" />
        <select value={missionId} onChange={(event) => setMissionId(event.target.value)}>
          <option value="">No mission</option>
          {missions.map((mission) => (
            <option key={mission.id} value={mission.id}>{mission.title}</option>
          ))}
        </select>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the log entry..." />
        <button className="primaryButton" type="submit">
          <Plus size={18} /> Save Log
        </button>
      </form>
      <div className="list">
        {notes.map((note) => (
          <article className="logEntry" key={note.id}>
            <span className="meta">{note.mission_title || 'General'}</span>
            <h3>{note.title}</h3>
            <p>{note.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Stats({ stats, missions }) {
  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ТЕЛЕМЕТРИЯ</span>
          <h1>Stats</h1>
          <p>V1 telemetry is simple and based on completed focus sessions.</p>
        </div>
      </div>
      <div className="metricGrid">
        <Metric label="Total focus minutes" value={stats?.totalFocusMinutes ?? 0} />
        <Metric label="Total sessions" value={stats?.totalFocusSessions ?? 0} />
        <Metric label="Missions created" value={missions.length} />
      </div>
    </section>
  )
}

function Companion({ pet }) {
  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ЛАЙКА</span>
          <h1>Companion</h1>
          <p>V1 keeps Laika simple: ready, focus, and celebration states.</p>
        </div>
      </div>
      <section className="panel companionPanel largeCompanion">
        <div className="laika celebrating">▟◕ᴥ◕▙</div>
        <h2>{pet?.name ?? 'Laika'}</h2>
        <p>Current mood: {pet?.mood ?? 'ready'}</p>
      </section>
    </section>
  )
}

function ProSimulation({ onActivate }) {
  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ГОТОВО</span>
          <h1>Sputnik Pro</h1>
          <p>V1 includes only the offline simulation toggle. No real payments.</p>
        </div>
        <button className="primaryButton" onClick={onActivate}>
          <Crown size={18} /> Activate Simulation
        </button>
      </div>
    </section>
  )
}

function SettingsPanel({ settings }) {
  return (
    <section className="screen">
      <div className="screenHeader">
        <div>
          <span className="stamp">ПУЛЬТ</span>
          <h1>Settings</h1>
          <p>Focus defaults are stored locally in SQLite.</p>
        </div>
      </div>
      <section className="panel">
        <pre>{JSON.stringify(settings, null, 2)}</pre>
      </section>
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  )
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
