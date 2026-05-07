"use client";

export default function ChatInput({ input, onChange, onSend }) {
  return (
    <div className="chat-input-row">
      <input
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        className="input-shell chat-input font-lexend"
        placeholder="Ask about routines, focus, motivation, or planning"
      />
      <button type="button" onClick={onSend} className="btn-base btn-lg btn-pill theme-cta chat-send">
        Send
      </button>
    </div>
  );
}
