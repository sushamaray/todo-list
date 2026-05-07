# To-Do List

A polished Next.js productivity app with a daily dashboard, a task board, and a weekly routine planner. The app is local-first, responsive across mobile and desktop, and designed around calm visual structure rather than heavy setup.

Live demo: https://todolist-sush.vercel.app

## Features

- Bottom navigation for `Home`, `Todo List`, and `Weekly Routine`
- `Daily Focus` dashboard with progress, summary stats, and theme controls
- Task creation with optional `category`, `tag`, and `due date`
- Task editing, completion toggling, deletion, filtering, and search
- Urgency-aware task sorting that keeps overdue and dated work near the top
- Exportable task-board backups in `PNG`, `JPG`, and `PDF`
- Weekly routine planner with per-day entry management
- Manual routine time entry plus a compact `hour / minute / AM-PM` time picker
- Local persistence for tasks, routines, and theme preference using `localStorage`
- `light`, `dark`, and `system` themes
- Responsive layout and installable app icons for web-app style use

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- `html-to-image`
- `jspdf`
- `next/font`

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
src/app/
  components/
    BottomNav.jsx
    TaskItem.jsx
    routine/
    sections/
  globals.css
  layout.js
  page.js
```

## Behavior Notes

- Tasks and routines are saved per browser/device.
- Stored task and routine data is normalized so older local data can still load after feature changes.
- The due date field activates on focus and auto-fills with the current local date the first time it is opened.
- Weekly routine data is stored separately from the task board data.
- Routine entries can be created without a time, or with a selected `1-12` and `AM/PM` value.
- Theme preference is saved locally and defaults to `system` for first-time visitors.
- Exported backups capture the task board only, not the entire page UI.

## Screens

- `Home`: overview, progress summary, and theme switching
- `Todo List`: quick capture, filters, search, and exports
- `Weekly Routine`: weekly overview plus day-by-day routine editing

## Future Ideas

- Drag-and-drop task ordering
- Bulk task actions
- Import/export for local backups
- Optional cloud sync
