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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="theme-copy-muted text-xs uppercase tracking-[0.24em] font-lexend">
            AI Chat
          </p>
          <h2 className="theme-heading mt-1 text-3xl font-space font-bold">
            Productivity assistant
          </h2>
          <p className="theme-copy mt-3 max-w-2xl text-sm leading-6 font-alef">
            Ask for routine ideas, consistency tips, study structure, or lighter ways to manage your time. Replies are mocked for now, so the interface is ready before API integration.
          </p>
        </div>
      </div>

      <div className="chat-shell mt-6">
        <div ref={messageListRef} className="chat-messages">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        <ChatInput input={input} onChange={setInput} onSend={sendMessage} />
      </div>
    </section>
  );
}
