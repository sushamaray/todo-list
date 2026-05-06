"use client";
import { useState } from "react";

function getTodayDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - offset * 60_000);
  return localToday.toISOString().split("T")[0];
}

export default function TaskItem({
  task,
  toggleTask,
  deleteTask,
  updateTask,
  formatDisplayDate,
  categoryOptions,
  tagOptions,
  expandedTaskId,
  setExpandedTaskId
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editCategory, setEditCategory] = useState(task.category || "");
  const [editTag, setEditTag] = useState(task.tag || "");
  const [editDate, setEditDate] = useState(task.dueDate || "");
  const [editDateActivated, setEditDateActivated] = useState(Boolean(task.dueDate));
  const isExpanded = expandedTaskId === task.id;

  const activateEditDate = () => {
    setEditDateActivated(true);

    if (!editDate) {
      setEditDate(getTodayDate());
    }
  };

  const handleSave = () => {
    if (!editText.trim()) return;

    updateTask(task.id, {
      text: editText.trim(),
      dueDate: editDate || "",
      category: editCategory,
      tag: editTag
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.text);
    setEditCategory(task.category || "");
    setEditTag(task.tag || "");
    setEditDate(task.dueDate || "");
    setEditDateActivated(Boolean(task.dueDate));
    setIsEditing(false);
  };

  const toggleExpanded = () => {
    if (isEditing) return;
    setExpandedTaskId(isExpanded ? null : task.id);
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;

    const today = new Date();
    const due = new Date(`${task.dueDate}T00:00:00`);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const cardClasses = task.completed
    ? "border-emerald-200 bg-transparent dark:border-emerald-900/60 dark:bg-transparent"
    : isOverdue()
      ? "border-rose-200 bg-transparent dark:border-rose-900/60 dark:bg-transparent"
      : "border-stone-300 bg-transparent hover:-translate-y-0.5 hover:border-stone-500 hover:shadow-[0_20px_36px_rgba(28,25,23,0.12)] dark:border-slate-700 dark:bg-transparent dark:hover:border-slate-500 dark:hover:shadow-[0_20px_36px_rgba(0,0,0,0.24)]";
  return (
    <article
      onClick={toggleExpanded}
      className={`task-item-card theme-card animate-[fadeIn_0.24s_ease-in] rounded-[1.45rem] border p-4 transition-all duration-300 ${cardClasses}`}
    >
      <div className="task-item-shell flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="task-item-main flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTask(task.id);
            }}
            aria-label={
              task.completed
                ? `Mark ${task.text} as pending`
                : `Mark ${task.text} as complete`
            }
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              task.completed
                ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)] dark:border-emerald-600 dark:bg-emerald-600"
                : isOverdue()
                  ? "border-rose-200 bg-[var(--card-bg)] dark:border-rose-900/60 dark:bg-[var(--card-bg)]"
                  : "border-[var(--card-border)] bg-[var(--card-bg)] dark:border-[var(--card-border)] dark:bg-[var(--card-bg)]"
            }`}
          >
            {task.completed && (
              <span className="text-sm leading-none font-bold">✓</span>
            )}
          </button>

          {isEditing ? (
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                className="input-shell min-h-11 font-lexend"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <select
                className="input-shell min-h-11 font-lexend"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Select category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="input-shell min-h-11 font-lexend"
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Select tag</option>
                {tagOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type={editDateActivated || editDate ? "date" : "text"}
                inputMode="numeric"
                className={`input-shell min-h-11 font-lexend tabular-nums ${editDate ? "theme-heading" : "text-stone-400 dark:text-slate-400"}`}
                value={editDate}
                placeholder="dd/mm/yyyy"
                onFocus={activateEditDate}
                onClick={activateEditDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`task-item-text text-[1.02rem] font-alef ${
                    isExpanded ? "is-expanded" : ""
                  } ${
                    task.completed ? "text-stone-400 line-through dark:text-slate-400" : "theme-heading"
                  }`}
                >
                  {task.text}
                </p>

                {isOverdue() && (
                  <span className="rounded-full border border-red-300 bg-red-500 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white font-lexend shadow-[0_10px_24px_rgba(239,68,68,0.24)] dark:border-red-700 dark:bg-red-700 dark:text-red-50">
                    Overdue
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {task.category && (
                  <span className="task-meta-badge task-meta-badge-category">
                    {task.category}
                  </span>
                )}

                {task.tag && (
                  <span className={`task-meta-badge ${task.tag === "Urgent"
                    ? "task-meta-badge-tag-urgent"
                    : task.tag === "Medium"
                      ? "task-meta-badge-tag-medium"
                      : "task-meta-badge-tag-low"}`}
                  >
                    {task.tag}
                  </span>
                )}

                {task.dueDate ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs tabular-nums font-lexend font-semibold ${
                      isOverdue()
                        ? "border border-red-300 bg-red-500 text-white shadow-[0_12px_28px_rgba(239,68,68,0.28)] dark:border-red-700 dark:bg-red-700 dark:text-red-50"
                        : task.completed
                          ? "bg-stone-200 text-stone-700 dark:bg-slate-800 dark:text-slate-400"
                          : "border border-red-300 bg-red-500 text-white shadow-[0_12px_28px_rgba(239,68,68,0.28)] dark:border-red-700 dark:bg-red-700 dark:text-red-50"
                    }`}
                  >
                    Due {formatDisplayDate(task.dueDate)}
                  </span>
                ) : (
                  <span className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700 font-lexend dark:bg-slate-800 dark:text-slate-400">
                    No due date
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          data-export-hidden="true"
          className="flex flex-wrap items-center gap-2 lg:justify-end"
        >
          {isEditing ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="btn-base btn-sm theme-toggle-active"
              >
                Save
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="btn-base btn-sm theme-filter"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="btn-base btn-sm theme-filter"
            >
              Edit
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="btn-base btn-sm btn-danger"
            aria-label={`Delete ${task.text}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
