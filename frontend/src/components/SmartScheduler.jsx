import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "../api";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 - 22:00

const CATEGORY_COLORS = {
  Focus: { bg: "rgba(139,92,246,0.2)", border: "#8b5cf6", text: "#a78bfa" },
  Break: { bg: "rgba(6,182,212,0.2)", border: "#06b6d4", text: "#22d3ee" },
  Task: { bg: "rgba(16,185,129,0.2)", border: "#10b981", text: "#34d399" },
  Personal: { bg: "rgba(245,158,11,0.2)", border: "#f59e0b", text: "#fbbf24" },
  Study: { bg: "rgba(59,130,246,0.2)", border: "#3b82f6", text: "#60a5fa" },
};



function formatHour(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h;
  return `${display}:00 ${ampm}`;
}

export default function SmartScheduler() {
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    const data = await apiGet("/scheduler/blocks");

    const formatted = data.map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category,
      startHour: b.start_hour,
      duration: b.duration,
      day: b.day,
    }));

    setBlocks(formatted);
  };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Focus", startHour: 9, duration: 1 });

  const addBlock = async () => {
    if (!form.title.trim()) return;

    const newBlock = {
      title: form.title,
      category: form.category,
      start_hour: Number(form.startHour),
      duration: Number(form.duration),
      day: new Date().toISOString().split("T")[0],
    };

    const saved = await apiPost("/scheduler/blocks", newBlock);

    setBlocks(prev => [
      ...prev,
      {
        id: saved.id,
        title: saved.title,
        category: saved.category,
        startHour: saved.start_hour,
        duration: saved.duration,
        day: saved.day,
      }
    ]);

    setForm({ title: "", category: "Focus", startHour: 9, duration: 1 });
    setShowForm(false);
  };
  const removeBlock = async (id) => {
    await apiDelete(`/scheduler/blocks/${id}`);
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="fade-in-up">
      <div className="section-header">
        <h1 className="gradient-text">Smart Scheduler</h1>
        <p>Plan your day hour by hour. Stay on track and build powerful routines.</p>
      </div>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 8px rgba(139,92,246,0.8)" }} />
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{today}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
            <span key={cat} style={{
              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
              background: c.bg, color: c.text, border: `1px solid ${c.border}40`,
            }}>{cat}</span>
          ))}
        </div>
        <button id="add-block-btn" onClick={() => setShowForm(v => !v)} className="btn-primary" style={{ padding: "8px 20px" }}>
          {showForm ? "✕ Cancel" : "+ Add Block"}
        </button>
      </div>

      {/* Add Block Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 100px 80px auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Block Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Deep Work" className="tc-input" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="tc-input">
                {Object.keys(CATEGORY_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Start Hour</label>
              <select value={form.startHour} onChange={e => setForm(f => ({ ...f, startHour: Number(e.target.value) }))} className="tc-input">
                {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Hrs</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="tc-input">
                {[0.5, 1, 1.5, 2, 2.5, 3, 4].map(d => <option key={d} value={d}>{d}h</option>)}
              </select>
            </div>
            <button id="save-block-btn" onClick={addBlock} className="btn-primary" style={{ height: 44 }}>Save</button>
          </div>
        </div>
      )}

      {/* Timeline Grid */}
      <div className="glass-card" style={{ padding: 24, overflowX: "auto" }}>
        <div style={{ minWidth: 600 }}>
          {HOURS.map(hour => {
            const hourBlocks = blocks.filter(b => Math.floor(b.startHour) === hour ||
              (b.startHour < hour && b.startHour + b.duration > hour));
            const startsHere = blocks.filter(b => b.startHour === hour || (b.startHour > hour && b.startHour < hour + 1));

            return (
              <div key={hour} style={{
                display: "grid", gridTemplateColumns: "80px 1fr", gap: 12,
                borderBottom: "1px solid rgba(255,255,255,0.04)", minHeight: 52,
                alignItems: "stretch", padding: "6px 0",
              }}>
                {/* Time label */}
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                  fontFamily: "'Orbitron',sans-serif", paddingTop: 4,
                  letterSpacing: "0.04em",
                }}>
                  {formatHour(hour)}
                </div>

                {/* Blocks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                  {blocks
                    .filter(b => b.startHour === hour)
                    .map(b => {
                      const c = CATEGORY_COLORS[b.category] || CATEGORY_COLORS.Focus;
                      return (
                        <div key={b.id} className="schedule-block" style={{
                          borderLeftColor: c.border,
                          background: c.bg,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          gap: 8,
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{b.title}</span>
                            <span style={{ fontSize: 11, color: c.text, marginLeft: 8, fontWeight: 500 }}>
                              {b.category} · {b.duration}h
                            </span>
                          </div>
                          <button onClick={() => removeBlock(b.id)} style={{
                            background: "none", border: "none", color: "var(--text-muted)",
                            cursor: "pointer", fontSize: 14, padding: "2px 6px",
                            borderRadius: 6, transition: "all 0.2s",
                          }}
                            onMouseEnter={e => e.currentTarget.style.color = "#f43f5e"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                          >✕</button>
                        </div>
                      );
                    })}
                  {blocks.filter(b => b.startHour === hour).length === 0 && (
                    <div style={{ height: 36, borderRadius: 8, background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.05)" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
