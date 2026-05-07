"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput from "../chat/ChatInput";
import ChatMessage from "../chat/ChatMessage";

const CHAT_STORAGE_KEY = "productivity-chat-messages";
const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    content: "I can help you shape routines, stay consistent, and plan your work in smaller, calmer steps."
  }
];

function getMockReply(prompt) {
  const text = prompt.toLowerCase();

  if (text.includes("routine")) {
    return "Try starting with a two-anchor routine: one action that begins your day and one that closes it. Once those feel automatic, layer in one more habit between them.";
  }

  if (text.includes("motivation") || text.includes("discipline")) {
    return "Lean on momentum instead of waiting for motivation. Pick a version of the task that takes five minutes, finish it, and let that win carry you into the next step.";
  }

  if (text.includes("study") || text.includes("exam")) {
    return "Break study time into focused blocks with a clear target for each session: review, practice, or recall. Ending each block with a quick summary helps retention.";
  }

  if (text.includes("time") || text.includes("schedule") || text.includes("plan")) {
    return "Give your highest-energy hours to the work that needs the most thinking, and group lighter admin tasks into one smaller window later in the day.";
  }

  return "A good next step is to make the plan smaller and more specific. Tell me what part feels stuck, and I’ll help you turn it into an easier action.";
}

export default function ChatSection() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const messageListRef = useRef(null);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(CHAT_STORAGE_KEY);

      if (!storedValue) {
        setHasLoaded(true);
        return;
      }

      const parsed = JSON.parse(storedValue);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      }
    } catch (error) {
      console.error("Failed to load chat messages", error);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [hasLoaded, messages]);

  useEffect(() => {
    const node = messageListRef.current;

    if (!node) return;

    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = input.trim();

    if (!trimmed) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed
    };
    const assistantMessage = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: getMockReply(trimmed)
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <section className="glass-panel animate-[slideUp_0.65s_ease-out] rounded-[2rem] p-4 sm:p-6 lg:p-7">
      <div>
        <span className="theme-chip inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em] font-lexend">
          AI Chat
        </span>
        <h2 className="mt-4 text-4xl font-bold leading-none font-space sm:text-[3.25rem]">
          <span className="theme-heading">Ask</span>{" "}
          <span className="theme-subheading">Clearly</span>
        </h2>
      </div>

      <p className="theme-copy mt-3 max-w-md text-[15px] leading-7 font-alef">
        Ask for routine ideas, study structure, or lighter ways to manage your time. Replies are mocked for now so the interface is ready before API integration.
      </p>

      <div className="theme-card mt-6 rounded-[1.7rem] border p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
            Productivity Assistant
          </p>
          <p className="theme-heading text-base font-alef">
            Talk through stuck moments and turn vague pressure into the next manageable step.
          </p>
        </div>

        <div className="chat-shell mt-5">
          <div ref={messageListRef} className="chat-messages">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>

          <ChatInput input={input} onChange={setInput} onSend={sendMessage} />
        </div>
      </div>
    </section>
  );
}
