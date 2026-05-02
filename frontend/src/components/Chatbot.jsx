import { useEffect, useRef } from "react";

export default function Chatbot({ chatMessages, chatInput, setChatInput, sendChatMessage, chatLoading, optimizeMyDay }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);
  const suggestions = [
    "Explain DBMS normalization",
    "Create a 7-day study plan",
    "Give me OS interview questions",
    "How to improve focus?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: 500 }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h1 className="gradient-text">AI Study Assistant</h1>
        <p>Powered by AI — ask anything about studies, plans, or concepts.</p>
      </div>

      {chatMessages.length <= 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={optimizeMyDay} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: "linear-gradient(135deg,#f59e0b,#ef4444)", border: "none",
              color: "#fff", cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(245,158,11,0.3)"
          }}>
            ✨ Optimize My Day
          </button>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setChatInput(s)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
              color: "var(--purple-light)", cursor: "pointer", transition: "all 0.2s",
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div id="chat-messages-area" style={{
        flex: 1, overflowY: "auto", padding: "20px 16px",
        background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)",
        borderRadius: 20, marginBottom: 12, display: "flex", flexDirection: "column", gap: 16,
      }}>
        {chatMessages.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            alignItems: "flex-end", gap: 10,
          }}>
            {msg.sender === "bot" && (
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🤖</div>
            )}
            <div className={msg.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot"} style={{ maxWidth: "72%" }}>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{msg.text}</div>
            </div>
            {msg.sender === "user" && (
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,#10b981,#06b6d4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
              }}>👤</div>
            )}
          </div>
        ))}
        {chatLoading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🤖</div>
            <div className="chat-bubble-bot" style={{ display: "flex", gap: 6, padding: "14px 18px" }}>
              <div className="chat-typing-dot" />
              <div className="chat-typing-dot" />
              <div className="chat-typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        display: "flex", gap: 10, alignItems: "center",
        background: "rgba(255,255,255,0.04)", border: "1px solid var(--glass-border)",
        borderRadius: 16, padding: "10px 12px",
      }}>
        <input
          id="chat-input"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
          placeholder="Ask anything... (Enter to send)"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "var(--text-primary)", fontSize: 14, lineHeight: 1.5,
          }}
        />
        <button id="send-chat-btn" onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} style={{
          padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: chatLoading || !chatInput.trim() ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#8b5cf6,#6366f1)",
          color: chatLoading || !chatInput.trim() ? "var(--text-muted)" : "#fff",
          border: "none", cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
          transition: "all 0.2s", whiteSpace: "nowrap",
          boxShadow: chatLoading || !chatInput.trim() ? "none" : "0 4px 16px rgba(139,92,246,0.4)",
        }}>
          {chatLoading ? "..." : "Send ↑"}
        </button>
      </div>
    </div>
  );
}
