"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import TaskItem from "./components/TaskItem";

const MAX_EXPORT_DIMENSION = 16_000;
const FILTERS = ["all", "pending", "completed"];
const CATEGORY_OPTIONS = ["Work", "Personal", "Study", "Other"];
const TAG_OPTIONS = ["Urgent", "Low", "Medium"];
const THEME_OPTIONS = ["light", "dark", "system"];
const TASKS_STORAGE_KEY = "tasks";
const TASKS_EVENT = "tasks-updated";
const THEME_STORAGE_KEY = "theme-preference";
const THEME_EVENT = "theme-updated";
const EMPTY_TASKS = [];
let cachedTasksRaw = null;
let cachedTasksSnapshot = EMPTY_TASKS;

function normalizeTask(task) {
  const legacyTags = Array.isArray(task?.tags)
    ? task.tags.filter((tag) => typeof tag === "string" && tag.trim()).map((tag) => tag.trim())
    : [];

  return {
    ...task,
    id: typeof task?.id === "number" || typeof task?.id === "string"
      ? task.id
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: typeof task?.text === "string" ? task.text : "",
    completed: Boolean(task?.completed),
    dueDate: typeof task?.dueDate === "string" ? task.dueDate : "",
    category: typeof task?.category === "string" ? task.category : "",
    tag: typeof task?.tag === "string"
      ? task.tag
      : legacyTags[0] || "",
    order: Number.isFinite(task?.order) ? task.order : 0,
    tags: legacyTags
  };
}

function formatDisplayDate(value) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getTodayDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - offset * 60_000);
  return localToday.toISOString().split("T")[0];
}

function getStoredTasks() {
  if (typeof window === "undefined") return EMPTY_TASKS;

  try {
    const rawTasks = localStorage.getItem(TASKS_STORAGE_KEY);

    if (rawTasks === cachedTasksRaw) {
      return cachedTasksSnapshot;
    }

    cachedTasksRaw = rawTasks;

    if (!rawTasks) {
      cachedTasksSnapshot = EMPTY_TASKS;
      return cachedTasksSnapshot;
    }

    const savedTasks = JSON.parse(rawTasks);
    cachedTasksSnapshot = Array.isArray(savedTasks)
      ? savedTasks.map(normalizeTask)
      : EMPTY_TASKS;
    return cachedTasksSnapshot;
  } catch (err) {
    console.error("Failed to load tasks", err);
    cachedTasksRaw = null;
    cachedTasksSnapshot = EMPTY_TASKS;
    return EMPTY_TASKS;
  }
}

function getServerTasksSnapshot() {
  return EMPTY_TASKS;
}

function subscribeToTasks(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event) => {
    if (!event.key || event.key === TASKS_STORAGE_KEY) {
      callback();
    }
  };

  const handleLocalUpdate = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(TASKS_EVENT, handleLocalUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(TASKS_EVENT, handleLocalUpdate);
  };
}

function persistTasks(updater) {
  const nextTasks = typeof updater === "function" ? updater(getStoredTasks()) : updater;

  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(nextTasks));
  window.dispatchEvent(new Event(TASKS_EVENT));
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredThemePreference() {
  if (typeof window === "undefined") return "system";

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (!savedTheme) {
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    return "system";
  }

  return savedTheme;
}

function getServerThemePreference() {
  return "system";
}

function subscribeToThemePreference(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event) => {
    if (!event.key || event.key === THEME_STORAGE_KEY) {
      callback();
    }
  };

  const handleLocalUpdate = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_EVENT, handleLocalUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_EVENT, handleLocalUpdate);
  };
}

function persistThemePreference(nextTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

function getSystemThemeSnapshot() {
  return getSystemTheme();
}

function getServerSystemThemeSnapshot() {
  return "light";
}

function subscribeToSystemTheme(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);

  return () => {
    media.removeEventListener("change", callback);
  };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dateActivated, setDateActivated] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [openControlPanel, setOpenControlPanel] = useState(null);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const taskBoardRef = useRef(null);
  const exportBoardRef = useRef(null);
  const tasks = useSyncExternalStore(
    subscribeToTasks,
    getStoredTasks,
    getServerTasksSnapshot
  );
  const themePreference = useSyncExternalStore(
    subscribeToThemePreference,
    getStoredThemePreference,
    getServerThemePreference
  );
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getServerSystemThemeSnapshot
  );

  useEffect(() => {
    const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = themePreference;
  }, [systemTheme, themePreference]);

  const activateDateField = () => {
    setDateActivated(true);

    if (!dueDate) {
      setDueDate(getTodayDate());
    }
  };

  const addTask = () => {
    if (!input.trim()) return;

    const newTask = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      dueDate: dueDate || "",
      category,
      tag
    };

    persistTasks((prev) => [...prev, newTask]);
    setInput("");
    setCategory("");
    setTag("");
    setDueDate("");
    setDateActivated(false);
  };

  const deleteTask = (id) => {
    persistTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id) => {
    persistTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const updateTask = (id, updatedData) => {
    persistTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updatedData }
          : task
      )
    );
  };

  const clearCompleted = () => {
    persistTasks((prev) => prev.filter((task) => !task.completed));
  };

  const clearAllTasks = () => {
    persistTasks([]);
    setExpandedTaskId(null);
  };

  const toggleControlPanel = (panelName) => {
    setOpenControlPanel((prev) => (prev === panelName ? null : panelName));
  };

  const getPriority = (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (task.completed) return 4;

    if (task.dueDate) {
      const due = new Date(`${task.dueDate}T00:00:00`);
      due.setHours(0, 0, 0, 0);

      if (due < today) return 1;
      return 2;
    }

    return 3;
  };

  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;

    const today = new Date();
    const due = new Date(`${task.dueDate}T00:00:00`);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const downloadDataUrl = (dataUrl, extension) => {
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = dataUrl;
    link.download = `todo-list-task-board-${dateStamp}.${extension}`;
    link.click();
  };

  const getTaskBoardExportOptions = (node) => {
    const width = Math.max(node.scrollWidth, node.clientWidth, node.offsetWidth);
    const height = Math.max(node.scrollHeight, node.clientHeight, node.offsetHeight);
    const exportScale = Math.min(1, MAX_EXPORT_DIMENSION / width, MAX_EXPORT_DIMENSION / height);

    return {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: resolvedTheme === "dark" ? "#111827" : "#fffaf2",
      width,
      height,
      canvasWidth: Math.max(1, Math.round(width * exportScale)),
      canvasHeight: Math.max(1, Math.round(height * exportScale)),
      style: {
        width: `${width}px`,
        height: `${height}px`,
        overflow: "visible"
      }
    };
  };

  const exportTaskBoard = async (format) => {
    const node = exportBoardRef.current;

    if (!node) return;

    try {
      const exportOptions = getTaskBoardExportOptions(node);

      if (format === "png") {
        const dataUrl = await toPng(node, exportOptions);
        downloadDataUrl(dataUrl, "png");
        return;
      }

      if (format === "jpg") {
        const dataUrl = await toJpeg(node, {
          ...exportOptions,
          quality: 0.95
        });
        downloadDataUrl(dataUrl, "jpg");
        return;
      }

      if (format === "pdf") {
        const dataUrl = await toPng(node, exportOptions);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4"
        });
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });

        const pagePadding = 20;
        const pageWidth = pdf.internal.pageSize.getWidth() - pagePadding * 2;
        const pageHeight = pdf.internal.pageSize.getHeight() - pagePadding * 2;
        const scale = pageWidth / img.width;
        const sourceSliceHeight = Math.max(1, Math.floor(pageHeight / scale));
        let sourceOffsetY = 0;
        let isFirstPage = true;

        while (sourceOffsetY < img.height) {
          const currentSliceHeight = Math.min(sourceSliceHeight, img.height - sourceOffsetY);
          const sliceCanvas = document.createElement("canvas");
          const sliceContext = sliceCanvas.getContext("2d");

          if (!sliceContext) {
            throw new Error("Unable to prepare PDF export canvas.");
          }

          sliceCanvas.width = img.width;
          sliceCanvas.height = currentSliceHeight;
          sliceContext.drawImage(
            img,
            0,
            sourceOffsetY,
            img.width,
            currentSliceHeight,
            0,
            0,
            img.width,
            currentSliceHeight
          );

          const sliceDataUrl = sliceCanvas.toDataURL("image/png");
          const renderHeight = currentSliceHeight * scale;

          if (!isFirstPage) {
            pdf.addPage();
          }

          pdf.addImage(
            sliceDataUrl,
            "PNG",
            pagePadding,
            pagePadding,
            pageWidth,
            renderHeight
          );

          sourceOffsetY += currentSliceHeight;
          isFirstPage = false;
        }

        pdf.save(`todo-list-task-board-${new Date().toISOString().slice(0, 10)}.pdf`);
      }
    } catch (error) {
      console.error("Failed to export task board", error);
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    })
    .filter((task) => {
      if (!normalizedSearchQuery) return true;

      const searchableText = [
        task.text,
        task.category,
        task.tag
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    })
    .sort((a, b) => {
      const diff = getPriority(a) - getPriority(b);
      if (diff !== 0) return diff;
      return Number(b.id) - Number(a.id);
    });

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const overdueCount = tasks.filter(isTaskOverdue).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const isInputEmpty = !input.trim();
  const hasCompletedTasks = completedCount > 0;
  const hasTasks = tasks.length > 0;
  const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;
  const hasActiveSearch = normalizedSearchQuery.length > 0;
  const themeSummary = themePreference === "system"
    ? `System (${resolvedTheme})`
    : themePreference[0].toUpperCase() + themePreference.slice(1);

  const heroMessage =
    tasks.length === 0
      ? "Start with one small task and let momentum build from there."
      : overdueCount > 0
        ? `${overdueCount} task${overdueCount === 1 ? "" : "s"} need attention first.`
        : completionRate === 100
          ? "Everything is wrapped up. A clean board looks good on you."
          : `${pendingCount} task${pendingCount === 1 ? "" : "s"} still in motion.`;

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="theme-orb-left absolute left-[-8rem] top-[-5rem] h-56 w-56 rounded-full blur-3xl animate-[floatPanel_18s_ease-in-out_infinite]" />
        <div className="theme-orb-right absolute right-[-6rem] top-20 h-64 w-64 rounded-full blur-3xl animate-[floatPanel_22s_ease-in-out_infinite_reverse]" />
        <div className="theme-orb-bottom absolute bottom-[-7rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl animate-[pulseGlow_10s_ease-in-out_infinite]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 lg:flex-row lg:gap-6">
        <section className="glass-panel animate-[slideUp_0.6s_ease-out] overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:w-[30rem] lg:p-7 xl:w-[32rem]">
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="theme-chip inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-lexend">
                Daily Focus
              </span>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                  aria-label={`Theme menu, current theme ${themeSummary}`}
                  aria-expanded={isThemeMenuOpen}
                  className="theme-icon-button"
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
                    <path d="M12 3v2.5" />
                    <path d="M12 18.5V21" />
                    <path d="m5.64 5.64 1.77 1.77" />
                    <path d="m16.59 16.59 1.77 1.77" />
                    <path d="M3 12h2.5" />
                    <path d="M18.5 12H21" />
                    <path d="m5.64 18.36 1.77-1.77" />
                    <path d="m16.59 7.41 1.77-1.77" />
                    <circle cx="12" cy="12" r="3.25" />
                  </svg>
                </button>

                {isThemeMenuOpen && (
                  <div className="theme-menu absolute right-0 top-full z-20 mt-2 w-44 rounded-[1.25rem] p-2">
                    <p className="px-2 pb-1 text-[10px] uppercase tracking-[0.22em] font-lexend theme-copy-muted">
                      Theme
                    </p>
                    <div className="flex flex-col gap-1">
                      {THEME_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            persistThemePreference(option);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`btn-base w-full justify-between rounded-[0.95rem] px-3 py-2 capitalize ${
                            themePreference === option
                              ? "theme-toggle-active"
                              : "theme-toggle"
                          }`}
                        >
                          <span>{option}</span>
                          {themePreference === option && <span className="text-xs">[active]</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-none font-space sm:text-[3.25rem]">
              <span className="theme-heading">To-Do</span>{" "}
              <span className="theme-subheading">List</span>
            </h1>
          </div>

          <p className="theme-copy mt-5 max-w-sm text-[15px] leading-7 font-alef">
            A calmer task board with clearer priorities, softer motion, and just enough structure to keep the day moving.
          </p>

          <div className="theme-card mt-6 rounded-[1.6rem] border p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                  Status
                </p>
                <p className="theme-heading mt-1 text-base font-lexend">
                  {heroMessage}
                </p>
              </div>

              <div className="theme-card theme-stat-badge rounded-2xl border px-4 py-3 sm:self-stretch">
                <p className="theme-copy-muted text-[11px] uppercase tracking-[0.24em] font-lexend">
                  Progress
                </p>
                <p className="theme-heading font-lexend text-3xl font-semibold tabular-nums">
                  {completionRate}%
                </p>
              </div>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-stone-200/80 dark:bg-slate-700/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <article className="stat-card stat-card-compact animate-[slideUp_0.75s_ease-out]">
              <span className="stat-label">Total</span>
              <strong className="stat-value">{tasks.length}</strong>
            </article>
            <article className="stat-card stat-card-compact animate-[slideUp_0.85s_ease-out]">
              <span className="stat-label">Pending</span>
              <strong className="stat-value">{pendingCount}</strong>
            </article>
            <article className="stat-card stat-card-compact animate-[slideUp_0.95s_ease-out]">
              <span className="stat-label">Completed</span>
              <strong className="stat-value">{completedCount}</strong>
            </article>
          </div>

          <div className="theme-card mt-6 rounded-[1.7rem] border p-4 sm:p-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                    Quick Capture
                  </p>
                  <h2 className="theme-heading mt-1 text-2xl font-space font-bold">
                    Plan the next move
                  </h2>
                </div>

                <p className="theme-copy text-sm leading-6 font-alef">
                  Add a task fast, keep the extra context optional, and let the board surface what needs attention first.
                </p>
              </div>

              <div className="grid gap-3">
                <label className="flex flex-col gap-2">
                  <span className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
                    Task
                  </span>
                  <input
                    className="input-shell font-lexend"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter task"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isInputEmpty) addTask();
                    }}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="theme-copy-muted block min-h-10 text-xs uppercase tracking-[0.22em] font-lexend">
                      Category
                      <br />
                      (Optional)
                    </span>
                    <select
                      className="input-shell font-lexend"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="theme-copy-muted block min-h-10 text-xs uppercase tracking-[0.22em] font-lexend">
                      Tag
                      <br />
                      (Optional)
                    </span>
                    <select
                      className="input-shell font-lexend"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                    >
                      <option value="">Select tag</option>
                      {TAG_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="flex flex-col gap-2">
                    <span className="theme-copy-muted block min-h-10 text-xs uppercase tracking-[0.22em] font-lexend">
                      Due Date
                      <br />
                      (Optional)
                    </span>
                    <input
                      type={dateActivated || dueDate ? "date" : "text"}
                      inputMode="numeric"
                      className={`input-shell font-lexend tabular-nums ${dueDate ? "theme-heading" : "text-stone-400 dark:text-slate-400"}`}
                      value={dueDate}
                      placeholder="dd/mm/yyyy"
                      onFocus={activateDateField}
                      onClick={activateDateField}
                      onChange={(e) => setDueDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isInputEmpty) addTask();
                      }}
                    />
                  </label>

                  <button
                    onClick={addTask}
                    disabled={isInputEmpty}
                    className={`btn-base btn-lg btn-pill sm:min-w-40 ${
                      isInputEmpty
                        ? "btn-muted"
                        : "theme-cta"
                    }`}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel animate-[slideUp_0.72s_ease-out] min-w-0 flex-1 rounded-[2rem] p-3 sm:p-5 lg:p-7">
          <div
            ref={taskBoardRef}
            className="theme-task-board mt-5 rounded-[1.7rem] border p-4 sm:p-5"
          >
            <div className="export-board-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="export-board-heading">
                <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                  Task Board
                </p>
                <h3
                  data-export-hidden="true"
                  className="theme-heading mt-1 text-2xl font-space font-bold"
                >
                  Sorted by urgency
                </h3>
              </div>

              <div
                data-export-hidden="true"
                className="flex flex-col items-start gap-2 sm:items-end"
              >
                <div className="task-board-controls">
                  {openControlPanel && (
                    <div className="floating-controls-popover theme-menu rounded-[1.35rem] p-3">
                      {openControlPanel === "search" && (
                        <div className="flex min-w-[16rem] flex-col gap-2">
                          <span className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
                            Search
                          </span>
                          <input
                            className="input-shell min-h-11 font-lexend"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks, categories, or tags"
                          />
                        </div>
                      )}

                      {openControlPanel === "filter" && (
                        <div className="flex min-w-[13rem] flex-col gap-2">
                          <span className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
                            Filter
                          </span>
                          <div className="flex flex-col gap-2">
                            {FILTERS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setFilter(item)}
                                className={`btn-base btn-sm justify-start capitalize ${
                                  filter === item ? "theme-toggle-active" : "theme-filter"
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {openControlPanel === "clear" && (
                        <div className="flex min-w-[13rem] flex-col gap-2">
                          <span className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
                            Clear
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (hasCompletedTasks && window.confirm("Clear all completed tasks?")) {
                                clearCompleted();
                              }
                            }}
                            disabled={!hasCompletedTasks}
                            className={`btn-base btn-sm justify-start ${
                              hasCompletedTasks ? "btn-danger" : "btn-muted"
                            }`}
                          >
                            Clear Completed
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (hasTasks && window.confirm("Clear all tasks?")) {
                                clearAllTasks();
                              }
                            }}
                            disabled={!hasTasks}
                            className={`btn-base btn-sm justify-start ${
                              hasTasks ? "btn-danger" : "btn-muted"
                            }`}
                          >
                            Clear All
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="theme-panel floating-controls-rail rounded-[1.35rem] p-2">
                    <button
                      type="button"
                      onClick={() => toggleControlPanel("search")}
                      aria-label="Toggle search panel"
                      className={`theme-icon-button ${openControlPanel === "search" ? "floating-controls-active" : ""}`}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleControlPanel("filter")}
                      aria-label="Toggle filter panel"
                      className={`theme-icon-button ${openControlPanel === "filter" ? "floating-controls-active" : ""}`}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 6h16" />
                        <path d="M7 12h10" />
                        <path d="M10 18h4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleControlPanel("clear")}
                      aria-label="Toggle clear panel"
                      className={`theme-icon-button ${openControlPanel === "clear" ? "floating-controls-active" : ""}`}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6" />
                        <path d="M6.5 6 7.4 19a2 2 0 0 0 2 1.86h5.2a2 2 0 0 0 2-1.86L17.5 6" />
                        <path d="M10 10.5v5" />
                        <path d="M14 10.5v5" />
                      </svg>
                    </button>
                  </div>
                </div>

                <span className="theme-copy-muted text-xs uppercase tracking-[0.22em] font-lexend">
                  Backup
                </span>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => exportTaskBoard("png")}
                    className="btn-base btn-sm theme-filter"
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => exportTaskBoard("jpg")}
                    className="btn-base btn-sm theme-filter"
                  >
                    JPG
                  </button>
                  <button
                    type="button"
                    onClick={() => exportTaskBoard("pdf")}
                    className="btn-base btn-sm theme-filter"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="export-board-list mt-4 space-y-3">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  formatDisplayDate={formatDisplayDate}
                  categoryOptions={CATEGORY_OPTIONS}
                  tagOptions={TAG_OPTIONS}
                  expandedTaskId={expandedTaskId}
                  setExpandedTaskId={setExpandedTaskId}
                />
              ))}

              {filteredTasks.length === 0 && (
                <div className="theme-empty rounded-[1.5rem] border px-5 py-10 text-center">
                  <p className="theme-heading text-xl font-space">
                    {tasks.length === 0
                      ? "No tasks yet"
                      : hasActiveSearch
                        ? "No matching tasks"
                        : `No ${filter} tasks`}
                  </p>
                  <p className="theme-copy mt-2 text-sm leading-6 font-alef">
                    {tasks.length === 0
                      ? "Add your first task, give it a due date if you want, and let the board take care of the ordering."
                      : hasActiveSearch
                        ? "Try another search term or add a task that fits this view."
                        : `Switch filters or add a new task to fill this ${filter} lane.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute left-[-99999px] top-0 opacity-0">
        <div
          ref={exportBoardRef}
          className="export-capture-frame"
        >
          <div className="export-capture-board">
            <div className="export-capture-header">
              <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                Task Board
              </p>
            </div>

            <div className="export-capture-list">
              {filteredTasks.map((task) => {
                const overdue = isTaskOverdue(task);

                return (
                  <article
                    key={`export-${task.id}`}
                    className={`export-capture-card ${task.completed ? "is-completed" : overdue ? "is-overdue" : ""}`}
                  >
                    <div className="export-capture-main">
                      <span
                        aria-hidden="true"
                        className={`export-capture-check ${task.completed ? "is-checked" : ""}`}
                      >
                        {task.completed ? "✓" : ""}
                      </span>

                      <div className="export-capture-content">
                        <div className="export-capture-title-row">
                          <p className={`export-capture-title ${task.completed ? "is-completed" : ""}`}>
                            {task.text}
                          </p>

                          {overdue && (
                            <span className="export-capture-badge is-overdue">
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="export-capture-meta">
                          {task.category && (
                            <span className="export-capture-badge is-category">
                              {task.category}
                            </span>
                          )}

                          {task.tag && (
                            <span className="export-capture-badge is-tag">
                              {task.tag}
                            </span>
                          )}

                          <span className={`export-capture-badge ${overdue ? "is-overdue" : task.completed ? "is-completed" : "is-date"}`}>
                            {task.dueDate ? `Due ${formatDisplayDate(task.dueDate)}` : "No due date"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="theme-empty rounded-[1.5rem] border px-5 py-10 text-center">
                  <p className="theme-heading text-xl font-space">
                    {tasks.length === 0
                      ? "No tasks yet"
                      : hasActiveSearch
                        ? "No matching tasks"
                        : `No ${filter} tasks`}
                  </p>
                  <p className="theme-copy mt-2 text-sm leading-6 font-alef">
                    {tasks.length === 0
                      ? "Add your first task, give it a due date if you want, and let the board take care of the ordering."
                      : hasActiveSearch
                        ? "Try another search term or add a task that fits this view."
                        : `Switch filters or add a new task to fill this ${filter} lane.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
