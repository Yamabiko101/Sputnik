# Sputnik

<p align="center">
  <img src="docs/assets/sputnik-preview-v1.gif" alt="Sputnik V1 mission-control preview" width="760">
</p>

<p align="center">
  <strong>Offline mission-control productivity for planning, focus, and local progress tracking.</strong>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-v1-C83A32">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Electron-F4B95E">
  <img alt="Storage" src="https://img.shields.io/badge/storage-SQLite-8BAE66">
  <img alt="Mode" src="https://img.shields.io/badge/mode-offline-29231F">
</p>

Sputnik is a cozy retro desktop app for turning work into missions. V1 lets you create missions, break them into tasks, complete focus sessions, write crew log notes, and see simple local stats without depending on cloud services.

## V1 At A Glance

<p align="center">
  <img src="docs/assets/sputnik-flow-v1.gif" alt="Sputnik V1 flow animation" width="720">
</p>

```txt
Mission -> Tasks -> Focus Session -> Progress -> Crew Log
```

| Area | V1 Status |
| --- | --- |
| Missions | Create missions, view progress, track focus minutes |
| Tasks | Add tasks, complete tasks, connect tasks to focus |
| Focus | Run a mission-aware timer and save completed sessions |
| Crew Log | Save local notes for mission context |
| Stats | Show simple local totals and daily focus activity |
| Companion | Laika mood updates after focus progress |
| Pro | Local simulation only, no real payments |

## Download And Run

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

If you downloaded a ZIP from GitHub, unzip it, open a terminal inside the extracted `Sputnik` folder, then run:

```bash
npm install
npm run dev
```

## Requirements

- Node.js
- npm

The install step rebuilds `better-sqlite3` for Electron.

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies and rebuild native modules |
| `npm run dev` | Start the Electron app in development mode |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the built Electron app |
| `npm run rebuild` | Rebuild `better-sqlite3` manually |

## Version Plan

Sputnik is organized so each version can grow without losing the offline-first desktop core.

| Version | Theme | Planned Direction |
| --- | --- | --- |
| V1 | Orbital Core | Missions, tasks, focus, notes, stats, local SQLite |
| V2 | Navigation | Better planning views, richer filters, smoother mission workflows |
| V3 | Telemetry | Deeper stats, streaks, focus history, richer companion feedback |
| V4 | Docking Bay | Packaging, installer polish, export/import, backup workflows |

## V1 Smoke Flow

Use this flow after running the app:

1. Open the dashboard.
2. Create a mission.
3. Add tasks to the mission.
4. Select a mission and task in Focus.
5. Complete a focus session.
6. Confirm focus minutes and progress update.
7. Write a Crew Log note.

## Architecture

Sputnik keeps desktop-only capabilities out of the renderer:

```txt
React renderer -> preload window.sputnik -> IPC -> services/workflows -> repositories -> SQLite
```

SQLite and Electron APIs live in the main process. The renderer uses the preload API exposed as `window.sputnik`.

## Local Data

Sputnik stores data under Electron's `userData` directory in a local `sputnik/sputnik.sqlite` database.

Ignored local files include:

- `node_modules/`
- `out/`
- `dist/`
- SQLite database files

## Tech Stack

| Layer | Tools |
| --- | --- |
| Desktop shell | Electron |
| Build tooling | electron-vite, Vite |
| Interface | React, lucide-react |
| Storage | SQLite with better-sqlite3 |

## QA

Current V1 verification:

```bash
npm run build
```

There are no dedicated `test`, `lint`, or `typecheck` scripts in `package.json` yet.

## V1 Notes

- Sputnik is currently local and offline.
- Recommended minimum useful window size is around `900x620`.
- The Pro flow is only a local simulation in V1.
- Future versions should add automated checks before release.
