import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";

function generateSessionId() {
  // Simple unique ID generator (not UUID but okay for demo)
  return Math.random().toString(36).substr(2, 9);
}

export default function TravelAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I assist your travel plans today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  // On first load, generate or get sessionId from localStorage
  useEffect(() => {
    let storedId = localStorage.getItem("travelAssistantSessionId");
    if (!storedId) {
      storedId = generateSessionId();
      localStorage.setItem("travelAssistantSessionId", storedId);
    }
    setSessionId(storedId);
  }, []);

  // Scroll to bottom when new message added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleOpen = () => setOpen(!open);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const response = await axios.post("http://localhost:5001/chatbot", {
        sessionId,      // Send sessionId with each message
        message: input,
      });

      const botReply = response.data.reply;
      const botMsg = { role: "assistant", content: botReply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't respond right now." },
      ]);

    }
  };

  // Handle pressing Enter to send
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleOpen}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        title={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="w-6 h-6" aria-label="Close chat icon" /> : <MessageCircle className="w-6 h-6" aria-label="Open chat icon" />}
      </button>

      {/* Chat popup window */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80 h-[450px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Personal Travel Assistant Chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 rounded-t-xl text-white font-semibold">
            Personal Travel Assistant
            <button
              onClick={toggleOpen}
              aria-label="Close chat"
              className="hover:text-gray-300"
              title="Close chat"
            >
              <X className="w-5 h-5" aria-label="Close chat icon" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm" aria-live="polite" aria-atomic="false">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-200"
                    : "mr-auto bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                }`}
                aria-label={msg.role === "user" ? "You: " : "Assistant: "}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input box */}
          <div className="px-4 py-3 border-t border-gray-300 dark:border-gray-700 flex gap-2">
            <textarea
              rows={1}
              className="flex-1 resize-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask me about your trip..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
