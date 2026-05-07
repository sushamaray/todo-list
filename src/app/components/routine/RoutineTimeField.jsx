"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0")
);
const MERIDIEM_OPTIONS = ["AM", "PM"];

function parseDisplayTime(value) {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3];

  if (hours < 1 || hours > 12) {
    return null;
  }

  return {
    hours: String(hours),
    minutes,
    meridiem
  };
}

function formatDisplayTime(hours, minutes, meridiem) {
  return `${hours}:${minutes} ${meridiem}`;
}

export default function RoutineTimeField({
  id,
  value,
  onChange,
  placeholder = "6:00 AM"
}) {
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [pickerState, setPickerState] = useState({
    hours: "6",
    minutes: "00",
    meridiem: "AM"
  });
  const fieldRef = useRef(null);

  const parsedValue = useMemo(() => parseDisplayTime(value), [value]);

  useEffect(() => {
    if (parsedValue) {
      setPickerState(parsedValue);
    }
  }, [parsedValue]);

  useEffect(() => {
    if (!isPickerMode) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!fieldRef.current?.contains(event.target)) {
        setIsPickerMode(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isPickerMode]);

  const applyPickerValue = (nextState) => {
    setPickerState(nextState);
    onChange(formatDisplayTime(nextState.hours, nextState.minutes, nextState.meridiem));
  };

  return (
    <div ref={fieldRef} className="routine-time-field">
      <div className="routine-time-input-shell">
        <input
          id={id}
          type="text"
          inputMode="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-shell routine-input font-lexend tabular-nums ${
            value ? "theme-heading" : "text-stone-400 dark:text-slate-400"
          }`}
          placeholder={placeholder}
        />

        <button
          type="button"
          aria-label={isPickerMode ? "Close time picker" : "Open time picker"}
          aria-pressed={isPickerMode}
          onClick={() => setIsPickerMode((prev) => !prev)}
          className={`theme-icon-button routine-time-toggle ${
            isPickerMode ? "floating-controls-active" : ""
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-[1.05rem] w-[1.05rem]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7.75v4.5l3 1.75" />
          </svg>
        </button>
      </div>

      {isPickerMode && (
        <div className="routine-time-popover">
          <label className="routine-time-select-group">
            <select
              value={pickerState.hours}
              onChange={(e) => applyPickerValue({ ...pickerState, hours: e.target.value })}
              className="input-shell routine-time-select font-lexend"
              aria-label="Select hour"
            >
              {HOUR_OPTIONS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </label>

          <label className="routine-time-select-group">
            <select
              value={pickerState.minutes}
              onChange={(e) => applyPickerValue({ ...pickerState, minutes: e.target.value })}
              className="input-shell routine-time-select font-lexend"
              aria-label="Select minute"
            >
              {MINUTE_OPTIONS.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </label>

          <label className="routine-time-select-group">
            <select
              value={pickerState.meridiem}
              onChange={(e) => applyPickerValue({ ...pickerState, meridiem: e.target.value })}
              className="input-shell routine-time-select font-lexend"
              aria-label="Select AM or PM"
            >
              {MERIDIEM_OPTIONS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
