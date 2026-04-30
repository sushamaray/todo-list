# To-Do List

A polished Next.js task app with local persistence, urgency-aware sorting, search, optional categories and tags, visual task-board backups, installable app icons, and a responsive dashboard layout for both mobile and desktop.

Live demo: https://todolist-sush.vercel.app

## Highlights

- Add, edit, complete, and delete tasks with browser-based persistence via `localStorage`
- Left-side `Daily Focus` panel with status, progress, and evenly sized `Total`, `Pending`, and `Completed` summary cards
- Search tasks by title, category, or tags
- Filter tasks by `all`, `pending`, and `completed`
- Optional `category`, `tags`, and `due date` fields during task creation and editing
- Smart task ordering that keeps overdue and dated tasks near the top
- Export a backup-only task board as `PNG`, `JPG`, or `PDF` from right-aligned backup actions in the board header
- Theme switcher with `light`, `dark`, and `system` modes, with `system` as the default on first open
- Flexible due date flow: starts as `dd/mm/yyyy`, auto-fills today on activation, and stays editable
- App icons for favicon, Apple touch, PWA, and Android maskable installs
- Responsive two-panel layout with `Daily Focus` plus `Quick Capture` on the left and `Task Board` tools/content on the right
- Typography powered by `Space Grotesk`, `Lexend`, and `Alef`

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

## Project Structure

```text
src/app/
  components/TaskItem.jsx
  globals.css
  layout.js
  page.js
```

## Behavior Notes

- Tasks are saved per browser/device.
- Existing saved tasks are normalized so older local data still works after feature upgrades.
- The left panel combines the daily summary area and quick-capture form, while the right panel focuses on board controls and tasks.
- When the due date field is first activated, it fills with the current local date automatically.
- Users can still replace that auto-filled date with any other date they want.
- Theme preference is saved locally and defaults to `system` for first-time visitors.
- Backup exports capture a dedicated board-only layout, not the whole page.
- Exported backups include the full task board content, including long task lists.
- Exported backups hide board controls and task action buttons for a cleaner saved result.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Future Upgrade Ideas

- Quick keyboard shortcuts
- Multi-select bulk actions
- Optional cloud sync across devices
