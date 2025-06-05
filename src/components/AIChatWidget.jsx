import { useState, useRef } from "react";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm your AI travel assistant. Ask me anything about your trip!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: "ai", text: data.reply || "Sorry, I didn't get that." }]);
    } catch {
      setMessages(msgs => [...msgs, { sender: "ai", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div>
      {/* Floating Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-700 text-white rounded-full p-4 shadow-lg text-2xl hover:bg-blue-800 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Travel Assistant"
      >
        🤖
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-8 z-50 w-80 bg-white rounded-xl shadow-xl border border-blue-200 flex flex-col">
          <div className="bg-blue-700 text-white p-3 rounded-t-xl font-bold flex items-center justify-between">
            <span>AI Travel Assistant</span>
            <button className="ml-2 text-white" onClick={() => setOpen(false)} aria-label="Close chat">✖️</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[75%] ${msg.sender === "user" ? "bg-blue-100 text-blue-800" : "bg-blue-600 text-white"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>
          <form onSubmit={sendMessage} className="flex p-2 border-t">
            <input
              className="flex-1 border rounded px-2 py-1 mr-2"
              placeholder="Ask about packing, visas, safety..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              maxLength={250}
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading || !input.trim()}>{loading ? "..." : "Send"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
