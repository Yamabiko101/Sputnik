# Sputnik

<p align="center">
  <img src="docs/assets/sputnik-logo.svg" alt="Sputnik logo" width="180">
</p>

<p align="center">
  <strong>An offline desktop mission-control app for planning work, staying focused, and tracking progress locally.</strong>
</p>

<p align="center">
  <img alt="Desktop" src="https://img.shields.io/badge/Desktop-Electron-C83A32">
  <img alt="UI" src="https://img.shields.io/badge/UI-React-F4B95E">
  <img alt="Storage" src="https://img.shields.io/badge/Storage-SQLite-8BAE66">
  <img alt="Offline" src="https://img.shields.io/badge/Offline-First-29231F">
  <img alt="Release" src="https://img.shields.io/badge/Release-1.0.0-F4B95E">
  <img alt="macOS" src="https://img.shields.io/badge/macOS-Installer-8BAE66">
</p>

Sputnik is a cozy mission-control productivity app for people who want a local, focused workspace instead of another cloud dashboard. It combines local profiles, missions, tasks, focus sessions, notes, stats, achievements, settings, and a small companion system into a single desktop app.

The app is designed around a simple loop:

```txt
Log in -> Plan a mission -> Add tasks -> Focus -> Log notes -> Review stats -> Unlock rewards
```

<p align="center">
  <img src="docs/assets/screenshot-dashboard.jpg" alt="Sputnik dashboard preview" width="900">
</p>

## Current Release

Sputnik `1.0.0` is the complete macOS desktop release. This version adds the final local profile system and ships as a downloadable macOS installer.

## What's New

| Update | Description |
| --- | --- |
| Local profiles | Create password-protected profiles and keep each workspace separate |
| Profile login | Return to saved local profiles without mixing mission data |
| Profile settings | Rename profiles, change passwords, log out, or delete a profile with confirmation |
| Pixel avatars | Choose animated profile avatars, with a Pro avatar unlocked by the local Pro simulation |
| Separate local databases | Each profile stores its own missions, tasks, notes, stats, achievements, and companion state |
| Better activity tracking | Mission, task, and Crew Log edits/deletions now create activity events |
| Safer timer settings | Focus and break duration settings are validated before saving |
| macOS installer | Download the `.dmg`, drag Sputnik into Applications, and run it locally |

## Visual Tour

<table>
  <tr>
    <td width="50%">
      <img src="docs/assets/screenshot-auth.jpg" alt="Sputnik local profile screen">
      <strong>Local profile gate</strong><br>
      <sub>Create a password-protected workspace before entering Mission OS.</sub>
    </td>
    <td width="50%">
      <img src="docs/assets/screenshot-dashboard.jpg" alt="Sputnik dashboard screen">
      <strong>Mission dashboard</strong><br>
      <sub>See active missions, focus totals, streaks, and the activity timeline.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/assets/screenshot-missions.jpg" alt="Sputnik missions screen">
      <strong>Missions and tasks</strong><br>
      <sub>Break goals into clear tasks and connect them to focus sessions.</sub>
    </td>
    <td width="50%">
      <img src="docs/assets/screenshot-settings.jpg" alt="Sputnik settings screen">
      <strong>Profile and settings</strong><br>
      <sub>Tune timer defaults, manage your profile, and choose pixel avatars.</sub>
    </td>
  </tr>
</table>

## Product Flow

### 1. Create Or Open A Profile

<p align="center">
  <img src="docs/assets/screenshot-auth.jpg" alt="Sputnik profile login screen" width="820">
</p>

Sputnik starts with a local profile gate. Create a profile with a name and password, or log back into an existing profile. Profiles are stored locally and keep their workspaces separate.

### 2. Start From The Dashboard

<p align="center">
  <img src="docs/assets/screenshot-dashboard.jpg" alt="Sputnik dashboard screen" width="820">
</p>

The dashboard gives you a quick command-center view of your workspace. It shows the current mission, active mission count, focus minutes, completed sessions, recent activity, progress signals, and Laika's current mood.

Use it to answer: What am I working on, how much progress did I make today, and what should I do next?

### 3. Create Missions And Tasks

<p align="center">
  <img src="docs/assets/screenshot-missions.jpg" alt="Sputnik missions screen" width="820">
</p>

Missions are larger goals. Tasks are the smaller steps inside each mission. Sputnik lets you create missions, add tasks, mark tasks complete, launch focus from a mission, and see progress update from real local actions.

This keeps planning close to execution: you do not just write down work, you connect it to focus time.

### 4. Run Focus Sessions

<p align="center">
  <img src="docs/assets/screenshot-focus.jpg" alt="Sputnik focus screen" width="820">
</p>

The focus screen connects a Pomodoro-style session to the selected mission and optional task. Completing a session stores the focus minutes locally, updates mission progress, contributes to stats, and rewards companion progress.

The timer is intentionally large and calm so the app can stay open beside your work.

### 5. Keep A Crew Log

<p align="center">
  <img src="docs/assets/screenshot-crew-log.jpg" alt="Sputnik crew log screen" width="820">
</p>

Crew Log is a lightweight notes area for capturing context while the work is still fresh. Notes can be connected to missions so planning, progress, and reflections stay together.

Use it for decisions, blockers, end-of-session notes, or quick project logs.

### 6. Review Stats And Telemetry

<p align="center">
  <img src="docs/assets/screenshot-stats.jpg" alt="Sputnik stats screen" width="820">
</p>

Stats turns completed work into a readable activity picture. It shows total focus minutes, completed sessions, mission count, streaks, weekly focus bars, daily snapshots, and recent Mission OS activity.

Use it to review momentum and understand how your planning habits are changing over time.

### 7. Unlock Achievements

<p align="center">
  <img src="docs/assets/screenshot-achievements.jpg" alt="Sputnik achievements screen" width="820">
</p>

Achievements reward real local actions: creating missions, finishing focus sessions, writing logs, completing tasks, and activating the local Pro simulation. Progress is visible even before an achievement is fully unlocked.

### 8. Grow Laika

<p align="center">
  <img src="docs/assets/screenshot-companion.jpg" alt="Sputnik companion screen" width="820">
</p>

Laika is Sputnik's companion system. Completed work grants XP, increases levels, changes mood, and unlocks or equips different skins. The companion screen shows current XP, level progress, mood, and available skins.

### 9. Try Sputnik Pro Simulation

<p align="center">
  <img src="docs/assets/screenshot-pro.jpg" alt="Sputnik Pro simulation screen" width="820">
</p>

Sputnik Pro is a local-only simulation. It does not process payments or connect to a real billing service. In the app, it demonstrates how premium companion skins and a Pro achievement could unlock while staying fully offline.

### 10. Manage Settings And Profile

<p align="center">
  <img src="docs/assets/screenshot-settings.jpg" alt="Sputnik settings and profile screen" width="820">
</p>

Settings lets you tune focus, short break, and long break durations. It also lets you rename the active profile, change the local password, log out, delete the profile, and choose available pixel avatars.

## What Sputnik Includes

| Area | Description |
| --- | --- |
| Local Profiles | Create password-protected local profiles with separate data stores |
| Missions | Create goals, track progress, complete missions, and accumulate focus minutes |
| Tasks | Break missions into concrete work items and complete them from the mission flow |
| Focus | Run mission-aware focus sessions and save completed work locally |
| Crew Log | Write local notes connected to the work you are doing |
| Stats | Review focus totals, weekly activity, streaks, snapshots, and recent activity |
| Companion | Laika gains XP, levels up, changes mood, and supports unlockable skins |
| Achievements | Unlock rewards through real app activity |
| Settings | Tune focus timers and manage the active local profile |
| Pro Simulation | Local-only premium simulation that unlocks additional companion skins |
| Offline Storage | All app data is stored locally with SQLite |

## Download And Install

The easiest way to use Sputnik is to download the latest installer from GitHub:

<p align="center">
  <a href="https://github.com/Yamabiko101/Sputnik/releases/latest">
    <img alt="Download Sputnik" src="https://img.shields.io/badge/Download-Sputnik%20Installer-C83A32?style=for-the-badge">
  </a>
</p>

1. Open the [latest Sputnik release](https://github.com/Yamabiko101/Sputnik/releases/latest).
2. Download the `.dmg` file.
3. Open the `.dmg`.
4. Drag `Sputnik` into `Applications`.
5. Launch Sputnik from `Applications`.

On the first launch, macOS may ask for confirmation because the app is distributed directly from GitHub. If that happens, right-click `Sputnik`, choose `Open`, then confirm once.

The `.zip` file is also available for people who prefer opening the app directly without the installer window.

## Run From Source

Clone the repository:

```bash
git clone https://github.com/Yamabiko101/Sputnik.git
cd Sputnik
```

Install dependencies:

```bash
npm install
```

Run the desktop app:

```bash
npm run dev
```

If you downloaded the project as a ZIP from GitHub, unzip it, open a terminal inside the extracted `Sputnik` folder, then run:

```bash
npm install
npm run dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies and rebuild native modules |
| `npm run dev` | Start the Electron app in development mode |
| `npm run build` | Create a production build |
| `npm run dist:mac` | Create macOS `.dmg` and `.zip` installers in `release/` |
| `npm run preview` | Preview the built Electron app |
| `npm run rebuild` | Rebuild `better-sqlite3` manually |

## How The App Works

Sputnik is an Electron desktop app with a React renderer and a SQLite-backed main process.

```txt
React renderer -> preload window.sputnik -> IPC -> services/workflows -> repositories -> SQLite
```

The renderer does not access SQLite directly. Desktop and database capabilities stay in the Electron main process, while the renderer talks through a preload API exposed as `window.sputnik`.

## Local Data

Sputnik stores data under Electron's `userData` directory. Account records live in a local `sputnik/accounts.sqlite` database, and each profile gets its own `sputnik/profiles/<profile-id>/sputnik.sqlite` workspace database.

Ignored local files include:

- `node_modules/`
- `out/`
- `dist/`
- `release/`
- SQLite database files

## Tech Stack

| Layer | Tools |
| --- | --- |
| Desktop shell | Electron |
| Build tooling | electron-vite, Vite |
| Interface | React, lucide-react |
| Storage | SQLite, better-sqlite3 |

## Verification

The current project has been checked with:

```bash
npm run build
npm run dist:mac
npm audit
```

There are no dedicated `test`, `lint`, or `typecheck` scripts in `package.json` yet.

## Notes

- Sputnik is local and offline-first.
- Recommended minimum useful window size is around `900x620`.
- The Pro flow is a local simulation; there are no real payments.
- macOS may ask for first-launch confirmation because the release is distributed directly from GitHub.
