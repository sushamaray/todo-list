"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toJpeg, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import BottomNav from "./components/BottomNav";
import ChatSection from "./components/sections/ChatSection";
import HomeSection from "./components/sections/HomeSection";
import RoutineSection from "./components/sections/RoutineSection";
import TodoSection from "./components/sections/TodoSection";

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
  const [activeSection, setActiveSection] = useState("home");
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
    <main className="relative min-h-screen overflow-hidden px-3 py-4 pb-28 sm:px-5 sm:py-6 sm:pb-32 lg:px-8 lg:pb-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="theme-orb-left absolute left-[-8rem] top-[-5rem] h-56 w-56 rounded-full blur-3xl animate-[floatPanel_18s_ease-in-out_infinite]" />
        <div className="theme-orb-right absolute right-[-6rem] top-20 h-64 w-64 rounded-full blur-3xl animate-[floatPanel_22s_ease-in-out_infinite_reverse]" />
        <div className="theme-orb-bottom absolute bottom-[-7rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl animate-[pulseGlow_10s_ease-in-out_infinite]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        <div key={activeSection} className="section-transition">
          {activeSection === "home" && (
            <HomeSection
              THEME_OPTIONS={THEME_OPTIONS}
              completionRate={completionRate}
              completedCount={completedCount}
              heroMessage={heroMessage}
              isThemeMenuOpen={isThemeMenuOpen}
              pendingCount={pendingCount}
              persistThemePreference={persistThemePreference}
              setIsThemeMenuOpen={setIsThemeMenuOpen}
              tasksLength={tasks.length}
              themePreference={themePreference}
              themeSummary={themeSummary}
            />
          )}

          {activeSection === "todo" && (
            <TodoSection
              CATEGORY_OPTIONS={CATEGORY_OPTIONS}
              FILTERS={FILTERS}
              TAG_OPTIONS={TAG_OPTIONS}
              activateDateField={activateDateField}
              addTask={addTask}
              category={category}
              clearAllTasks={clearAllTasks}
              clearCompleted={clearCompleted}
              dateActivated={dateActivated}
              deleteTask={deleteTask}
              dueDate={dueDate}
              expandedTaskId={expandedTaskId}
              exportTaskBoard={exportTaskBoard}
              filter={filter}
              filteredTasks={filteredTasks}
              formatDisplayDate={formatDisplayDate}
              hasActiveSearch={hasActiveSearch}
              hasCompletedTasks={hasCompletedTasks}
              hasTasks={hasTasks}
              input={input}
              isInputEmpty={isInputEmpty}
              openControlPanel={openControlPanel}
              searchQuery={searchQuery}
              setCategory={setCategory}
              setDueDate={setDueDate}
              setExpandedTaskId={setExpandedTaskId}
              setFilter={setFilter}
              setInput={setInput}
              setSearchQuery={setSearchQuery}
              setTag={setTag}
              tag={tag}
              taskBoardRef={taskBoardRef}
              tasks={tasks}
              toggleControlPanel={toggleControlPanel}
              toggleTask={toggleTask}
              updateTask={updateTask}
            />
          )}

          {activeSection === "routine" && <RoutineSection />}

          {activeSection === "chat" && <ChatSection />}
        </div>
      </div>

      <BottomNav activeSection={activeSection} setActiveSection={setActiveSection} />

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
