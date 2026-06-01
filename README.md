# Sputnik

Sputnik is an offline Electron productivity app with a cozy retro mission-control feel. V1 helps you create missions, break them into tasks, complete focus sessions, write crew log notes, and see simple local progress stats.

## Features

- Dashboard with active mission, focus, session, and companion status.
- Mission creation with task tracking and progress.
- Focus timer connected to a selected mission and optional task.
- Crew Log notes, optionally attached to a mission.
- Local stats for completed sessions and focus minutes.
- Local SQLite persistence through Electron main process services.
- Sputnik Pro simulation toggle for the V1 demo flow.

## Tech Stack

- Electron
- electron-vite
- React
- Vite
- better-sqlite3
- lucide-react

## Requirements

- Node.js
- npm

## Download and Run

Clone the repository:

```bash
git clone https://github.com/Yamabiko101/Sputnik.git
cd Sputnik
```

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

If you download the project as a ZIP from GitHub, unzip it, open a terminal in the extracted `Sputnik` folder, then run:

```bash
npm install
npm run dev
```

## Setup

Install dependencies:

```bash
npm install
```

The install step runs `electron-rebuild` for `better-sqlite3`.

## Development

Run the app in development mode:

```bash
npm run dev
```

This starts the Vite renderer dev server and launches the Electron app.

## Build

Create a production build:

```bash
npm run build
```

Preview the built app:

```bash
npm run preview
```

## QA

Current V1 verification commands:

```bash
npm run build
```

There are no dedicated `test`, `lint`, or `typecheck` scripts in `package.json` yet.

Manual V1 smoke flow:

1. Open the dashboard.
2. Create a mission.
3. Add tasks to the mission.
4. Select the mission and a task in Focus.
5. Complete a focus session.
6. Confirm focus minutes and task progress update.
7. Write a Crew Log note.

## Architecture

Sputnik keeps desktop-only capabilities out of the renderer:

```txt
React renderer -> preload window.sputnik -> IPC -> services/workflows -> repositories -> SQLite
```

SQLite and Electron APIs live in the main process. The renderer uses the preload API exposed as `window.sputnik`.

## Local Data

The app stores SQLite data under Electron's `userData` directory in a `sputnik/sputnik.sqlite` database. Generated database files, `node_modules`, and build output are ignored by git.

## V1 Notes

- Sputnik is currently a local/offline desktop app.
- The useful minimum window size is about `900x620`.
- The Pro flow is a local simulation only; there are no real payments in V1.
- Automated tests and lint/typecheck scripts are not configured yet.
