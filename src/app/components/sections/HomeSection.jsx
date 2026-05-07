"use client";

export default function HomeSection({
  THEME_OPTIONS,
  completionRate,
  completedCount,
  heroMessage,
  isThemeMenuOpen,
  pendingCount,
  persistThemePreference,
  setIsThemeMenuOpen,
  tasksLength,
  themePreference,
  themeSummary
}) {
  return (
    <section className="glass-panel animate-[slideUp_0.6s_ease-out] overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-7">
      <div className="home-section-grid">
        <div className="min-w-0">
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
          <h1 className="mt-1 text-4xl font-bold leading-none font-space sm:text-[3.25rem]">
            <span className="theme-heading">To-Do</span>{" "}
            <span className="theme-subheading">List</span>
          </h1>

          <p className="theme-copy mt-2 max-w-xl text-[15px] leading-7 font-alef">
            A calmer task board with clearer priorities, softer motion, and just enough structure to keep the day moving.
          </p>
          <div className="theme-card home-status-card mt-5 rounded-[1.6rem] border p-4">
            <div className="home-status-layout">
              <div className="home-status-copy min-w-0">
                <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
                  Status
                </p>
                <p className="theme-heading mt-1 text-base font-andika">
                  {heroMessage}
                </p>
              </div>

              <div className="theme-card theme-stat-badge home-status-badge rounded-2xl border px-4 py-3">
                <p className="theme-copy-muted text-[11px] uppercase tracking-[0.24em] font-lexend">
                  Progress
                </p>
                <p className="theme-heading font-lexend text-3xl font-semibold tabular-nums">
                  {completionRate}%
                </p>
              </div>
            </div>

            <div className="home-status-progress mt-4 h-2.5 overflow-hidden rounded-full">
              <div
                className="home-status-progress-fill h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="stat-card stat-card-compact animate-[slideUp_0.75s_ease-out]">
          <span className="stat-label">Total</span>
          <strong className="stat-value">{tasksLength}</strong>
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
    </section>
  );
}
