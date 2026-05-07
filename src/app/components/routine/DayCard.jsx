"use client";

export default function DayCard({ day, routines, onOpen }) {
  return (
    <section className="theme-card routine-day-card rounded-[1.6rem] border p-4">
      <button
        type="button"
        onClick={onOpen}
        className="routine-day-toggle"
        aria-label={`Open ${day} routine`}
      >
        <div className="routine-day-copy">
          <p className="theme-copy-muted text-[11px] uppercase tracking-[0.22em] font-lexend">
            Day Plan
          </p>
          <div className="routine-day-heading-row mt-1">
            <h3 className="theme-heading routine-day-name text-xl font-space">{day}</h3>
            <div className="routine-day-meta">
              <span className="routine-count">{routines.length}</span>
              <span className="routine-chevron">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}
