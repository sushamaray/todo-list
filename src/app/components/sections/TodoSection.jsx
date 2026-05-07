"use client";

import TaskItem from "../TaskItem";

export default function TodoSection({
  CATEGORY_OPTIONS,
  FILTERS,
  TAG_OPTIONS,
  activateDateField,
  addTask,
  category,
  clearAllTasks,
  clearCompleted,
  dateActivated,
  deleteTask,
  dueDate,
  expandedTaskId,
  exportTaskBoard,
  filter,
  filteredTasks,
  formatDisplayDate,
  hasActiveSearch,
  hasCompletedTasks,
  hasTasks,
  input,
  isInputEmpty,
  openControlPanel,
  searchQuery,
  setCategory,
  setDueDate,
  setExpandedTaskId,
  setFilter,
  setInput,
  setSearchQuery,
  setTag,
  tag,
  taskBoardRef,
  tasks,
  toggleControlPanel,
  toggleTask,
  updateTask
}) {
  return (
    <div className="todo-section-grid">
      <section className="glass-panel animate-[slideUp_0.6s_ease-out] rounded-[2rem] p-4 sm:p-6 lg:p-7">
        <div>
          <span className="theme-chip inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-lexend">
            Quick Capture
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-none font-space sm:text-[3.25rem]">
            <span className="theme-heading">Plan</span>{" "}
            <span className="theme-subheading">Fast</span>
          </h2>
        </div>

        <p className="theme-copy mt-3 max-w-sm text-[15px] leading-7 font-alef">
          Add a task in seconds, keep the extra context optional, and let the board surface what needs attention first.
        </p>

        <div className="theme-card mt-6 rounded-[1.7rem] border p-4 sm:p-5">
          <div className="grid gap-3">
            <div className="flex flex-col gap-1">
              <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                New Task
              </p>
              <p className="theme-heading text-base font-alef">
                Capture the next move before it slips away.
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

      <section className="glass-panel animate-[slideUp_0.72s_ease-out] min-w-0 rounded-[2rem] p-3 sm:p-5 lg:p-7">
        <div className="px-1 pb-4 sm:px-0">
          <span className="theme-chip inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-lexend">
            Task Board
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-none font-space sm:text-[3.25rem]">
            <span className="theme-heading">See</span>{" "}
            <span className="theme-subheading">Flow</span>
          </h2>
          <p className="theme-copy mt-3 max-w-md text-[15px] leading-7 font-alef">
            Search, filter, clear, and export from one calmer board that keeps urgent work closest to the top.
          </p>
        </div>

        <div
          data-export-hidden="true"
          className="task-board-controls"
        >
          <div className="task-board-controls-shell">
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
          </div>
        </div>

        <div
          ref={taskBoardRef}
          className="theme-task-board rounded-[1.7rem] border p-4 sm:p-5"
        >
          <div className="export-board-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="export-board-heading">
              <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                Sorted View
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
  );
}
