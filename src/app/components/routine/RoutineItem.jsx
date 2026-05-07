"use client";

import { useState } from "react";
import RoutineTimeField from "./RoutineTimeField";

export default function RoutineItem({ routine, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [time, setTime] = useState(routine.time);
  const [task, setTask] = useState(routine.task);

  const handleCancel = () => {
    setTime(routine.time);
    setTask(routine.task);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!task.trim()) return;

    onSave({
      ...routine,
      time: time.trim(),
      task: task.trim()
    });
    setIsEditing(false);
  };

  return (
    <article className="routine-item">
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <RoutineTimeField
            id={`routine-time-edit-${routine.id}`}
            value={time}
            onChange={setTime}
            placeholder="6:00 AM"
          />
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="input-shell routine-input font-lexend"
            placeholder="Routine task"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} className="btn-base btn-sm theme-toggle-active">
              Save
            </button>
            <button type="button" onClick={handleCancel} className="btn-base btn-sm theme-filter">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="routine-item-row">
          <div className="min-w-0">
            <p className="routine-time">{routine.time || "Any time"}</p>
            <p className="routine-task">{routine.task}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={() => setIsEditing(true)} className="btn-base btn-sm theme-filter">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="btn-base btn-sm btn-danger">
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
