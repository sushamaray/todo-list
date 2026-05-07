"use client";

import { useEffect, useState } from "react";
import DayCard from "../routine/DayCard";
import RoutineDetailView from "../routine/RoutineDetailView";

const ROUTINE_STORAGE_KEY = "weekly-routines";
const WEEK_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function createDefaultRoutineDays() {
  return WEEK_DAYS.map((day) => ({
    day,
    routines: []
  }));
}

function normalizeRoutineDays(value) {
  if (!Array.isArray(value)) {
    return createDefaultRoutineDays();
  }

  return WEEK_DAYS.map((day) => {
    const matchingDay = value.find((item) => item?.day === day);
    const routines = Array.isArray(matchingDay?.routines)
      ? matchingDay.routines
          .filter((routine) => typeof routine?.task === "string" && routine.task.trim())
          .map((routine, index) => ({
            id: routine?.id || `${day}-${index}`,
            time: typeof routine?.time === "string" ? routine.time : "",
            task: routine.task.trim()
          }))
      : [];

    return { day, routines };
  });
}

export default function RoutineSection() {
  const [routineDays, setRoutineDays] = useState(createDefaultRoutineDays);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(ROUTINE_STORAGE_KEY);

      if (!storedValue) {
        setHasLoaded(true);
        return;
      }

      setRoutineDays(normalizeRoutineDays(JSON.parse(storedValue)));
    } catch (error) {
      console.error("Failed to load weekly routines", error);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routineDays));
  }, [hasLoaded, routineDays]);

  const addRoutine = (day, routine) => {
    setRoutineDays((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? { ...entry, routines: [...entry.routines, routine] }
          : entry
      )
    );
  };

  const deleteRoutine = (day, routineId) => {
    setRoutineDays((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? { ...entry, routines: entry.routines.filter((routine) => routine.id !== routineId) }
          : entry
      )
    );
  };

  const updateRoutine = (day, nextRoutine) => {
    setRoutineDays((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              routines: entry.routines.map((routine) =>
                routine.id === nextRoutine.id ? nextRoutine : routine
              )
            }
          : entry
      )
    );
  };

  const totalEntries = routineDays.reduce((sum, entry) => sum + entry.routines.length, 0);
  const selectedDayEntry = routineDays.find((entry) => entry.day === selectedDay) || null;

  return (
    <section className="glass-panel animate-[slideUp_0.65s_ease-out] rounded-[2rem] p-4 sm:p-6 lg:p-7">
      {selectedDayEntry ? (
        <RoutineDetailView
          dayEntry={selectedDayEntry}
          onAddRoutine={addRoutine}
          onBack={() => setSelectedDay(null)}
          onDeleteRoutine={deleteRoutine}
          onUpdateRoutine={updateRoutine}
        />
      ) : (
        <>
          <div>
            <span className="theme-chip inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-lexend">
              Weekly Routine
            </span>
            <h2 className="mt-6 text-4xl font-bold leading-none font-space sm:text-[3.25rem]">
              <span className="theme-heading">Build</span>{" "}
              <span className="theme-subheading">Rhythm</span>
            </h2>
          </div>

          <p className="theme-copy mt-3 max-w-md text-[15px] leading-7 font-alef">
            Open a day, shape its flow, and turn scattered plans into a steadier weekly rhythm.
          </p>

          <div className="theme-card mt-6 rounded-[1.7rem] border p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                  Routine Map
                </p>
                <p className="theme-heading mt-1 text-base font-alef">
                  Choose a day to review, add, and refine your repeatable plan.
                </p>
              </div>

              <div className="routine-summary">
                <span className="routine-summary-label">Total Entries</span>
                <strong className="routine-summary-value">{totalEntries}</strong>
              </div>
            </div>

            <div className="routine-grid mt-6">
              {routineDays.map((entry) => (
                <DayCard
                  key={entry.day}
                  day={entry.day}
                  routines={entry.routines}
                  onOpen={() => setSelectedDay(entry.day)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
