"use client";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6.5h5V21" />
      </svg>
    )
  },
  {
    id: "todo",
    label: "Todo List",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11.5 11 13.5l4-4" />
        <path d="M20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5Z" />
      </svg>
    )
  },
  {
    id: "routine",
    label: "Weekly Routine",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 9h16" />
        <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
        <path d="M8 13h3" />
        <path d="M13 13h3" />
        <path d="M8 16.5h3" />
      </svg>
    )
  },
  {
    id: "chat",
    label: "AI Chat",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10.5h10" />
        <path d="M7 14.5h6" />
        <path d="M7.5 4h9A3.5 3.5 0 0 1 20 7.5v7A3.5 3.5 0 0 1 16.5 18H12l-4.5 3V18h0A3.5 3.5 0 0 1 4 14.5v-7A3.5 3.5 0 0 1 7.5 4Z" />
      </svg>
    )
  }
];

export default function BottomNav({ activeSection, setActiveSection }) {
  return (
    <nav className="bottom-nav-shell" aria-label="Primary">
      <div className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeSection;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`bottom-nav-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <span aria-hidden="true" className="bottom-nav-active-ring" />
              <span className="bottom-nav-icon">{item.icon}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
