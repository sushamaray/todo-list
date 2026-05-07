"use client";

import { useState } from "react";
import RoutineItem from "./RoutineItem";
import RoutineTimeField from "./RoutineTimeField";

export default function RoutineDetailView({
  dayEntry,
  onAddRoutine,
  onBack,
  onDeleteRoutine,
  onUpdateRoutine
}) {
  const [time, setTime] = useState("");
  const [task, setTask] = useState("");

  const handleAdd = () => {
    if (!task.trim()) return;

    onAddRoutine(dayEntry.day, {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time,
      task: task.trim()
    });
    setTime("");
    setTask("");
  };

  return (
    <div className="routine-detail-view">
      <button type="button" onClick={onBack} className="btn-base btn-md btn-pill theme-cta routine-back-button">
        <span>Back to week</span>
      </button>

      <section className="theme-card routine-detail-card rounded-[1.8rem] border p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
              Day Plan
            </p>
            <h3 className="theme-heading mt-1 text-3xl font-space font-bold">{dayEntry.day}</h3>
            <p className="theme-copy mt-3 max-w-2xl text-sm leading-6 font-alef">
              Add routines for this day, adjust timing when plans shift, and keep the list focused on what you actually want to repeat.
            </p>
          </div>

          <div className="routine-summary">
            <span className="routine-summary-label">Entries</span>
            <strong className="routine-summary-value">{dayEntry.routines.length}</strong>
          </div>
        </div>

        <div className="routine-detail-grid mt-6">
          <div className="theme-soft-card rounded-[1.5rem] border p-4">
            <p className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
              Add Entry
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <RoutineTimeField
                id={`routine-time-${dayEntry.day}`}
                value={time}
                onChange={setTime}
                placeholder="6:00 AM"
              />
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="input-shell routine-input font-lexend"
                placeholder="Add routine or task"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
              <button type="button" onClick={handleAdd} className="btn-base btn-md btn-pill theme-cta justify-center">
                Add Entry
              </button>
            </div>
          </div>

          <div className="theme-soft-card routine-detail-list-shell rounded-[1.5rem] border p-4">
            <p className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
              Routine List
            </p>

            <div className="routine-list">
              {dayEntry.routines.length > 0 ? (
                dayEntry.routines.map((routine) => (
                  <RoutineItem
                    key={routine.id}
                    routine={routine}
                    onDelete={() => onDeleteRoutine(dayEntry.day, routine.id)}
                    onSave={(nextRoutine) => onUpdateRoutine(dayEntry.day, nextRoutine)}
                  />
                ))
              ) : (
                <div className="routine-empty">
                  <p className="theme-copy text-sm font-alef">
                    No entries yet. Add your first step for {dayEntry.day}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
