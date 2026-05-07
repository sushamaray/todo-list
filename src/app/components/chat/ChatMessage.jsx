"use client";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`chat-row ${isUser ? "is-user" : "is-assistant"}`}>
      <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
        <p className="chat-role">{isUser ? "You" : "Productivity AI"}</p>
        <p className="chat-copy">{message.content}</p>
      </div>
    </article>
  );
}
