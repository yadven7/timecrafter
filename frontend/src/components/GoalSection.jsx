import { apiDelete, apiPatch } from "../api";
function ProgressRing({ percent, size = 100, stroke = 8, color = "#8b5cf6" }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)", flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}
      />
    </svg>
  );
}

const gradients = [
  "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.08))",
  "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.08))",
  "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.08))",
  "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.08))",
];
const ringColors = ["#8b5cf6","#10b981","#3b82f6","#f59e0b"];

export default function GoalSection({
  goals, goalTitle, setGoalTitle, dueDate, setDueDate,
  progress, setProgress, editingGoalId, setEditingGoalId,
  addGoal, updateGoal, fetchGoals, user,
  quote, showPreviousQuote, showNextQuote,
}) {

  const deleteGoal = async (id) => {
    try {
      await apiDelete(`/goals/${id}`);
      fetchGoals();
    } catch (err) { console.error("Error deleting goal:", err); }
  };

  const setQuickProgress = async (goalId, value) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    try {
      await apiPatch(`/goals/${goalId}`, { title: goal.title, due_date: goal.due_date || null, progress: value });
      fetchGoals();
    } catch (err) { console.error("Error setting progress:", err); }
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="fade-in-up">
      <div className="section-header">
        <h1 className="gradient-text">Study Goals</h1>
        <p>Sprint towards your goals with clear milestones and focus.</p>
      </div>

      {/* Quote Banner */}
      <div style={{
        background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.15),rgba(6,182,212,0.1))",
        border:"1px solid rgba(139,92,246,0.25)",
        borderRadius:20, padding:"20px 24px", marginBottom:24,
        backdropFilter:"blur(20px)",
      }}>
        <p style={{fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em", color:"rgba(167,139,250,0.7)", textAlign:"center", marginBottom:10}}>
          ✨ Motivational Quote
        </p>
        <h2 style={{fontSize:18, fontWeight:600, color:"var(--text-primary)", textAlign:"center", lineHeight:1.6, fontStyle:"italic", margin:"0 0 16px"}}>
          "{quote || "Stay focused and keep moving forward."}"
        </h2>
        <div style={{display:"flex", justifyContent:"center", gap:12}}>
          <button id="prev-quote-btn" onClick={showPreviousQuote} className="btn-secondary" style={{padding:"6px 16px", fontSize:16}}>←</button>
          <button id="next-quote-btn" onClick={showNextQuote} className="btn-secondary" style={{padding:"6px 16px", fontSize:16}}>→</button>
        </div>
        <p style={{fontSize:11, color:"rgba(255,255,255,0.35)", textAlign:"center", marginTop:8}}>Use ← → keys to navigate</p>
      </div>

      {/* Add / Edit Goal Form */}
      <div className="glass-card" style={{padding:24, marginBottom:24}}>
        <h2 style={{fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:16}}>
          {editingGoalId ? "✏️ Edit Goal" : "🎯 Add New Goal"}
        </h2>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 120px auto", gap:12, alignItems:"end"}}>
          <div>
            <label style={{fontSize:12, color:"var(--text-muted)", fontWeight:600, display:"block", marginBottom:6}}>Goal Title</label>
            <input
              id="goal-title-input"
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              placeholder="e.g. Master Data Structures"
              className="tc-input"
            />
          </div>
          <div>
            <label style={{fontSize:12, color:"var(--text-muted)", fontWeight:600, display:"block", marginBottom:6}}>Deadline</label>
            <input
              id="goal-deadline-input"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="tc-input"
            />
          </div>
          <div>
            <label style={{fontSize:12, color:"var(--text-muted)", fontWeight:600, display:"block", marginBottom:6}}>Progress %</label>
            <input
              id="goal-progress-input"
              type="number" min="0" max="100"
              value={progress}
              onChange={e => setProgress(e.target.value)}
              className="tc-input"
            />
          </div>
          <div style={{display:"flex", gap:8}}>
            <button
              id={editingGoalId ? "update-goal-btn" : "add-goal-btn"}
              onClick={editingGoalId ? updateGoal : addGoal}
              className="btn-primary"
              style={{height:44}}
            >
              {editingGoalId ? "Update" : "Add"}
            </button>
            {editingGoalId && (
              <button
                id="cancel-goal-btn"
                onClick={() => { setEditingGoalId(null); setGoalTitle(""); setDueDate(""); setProgress(0); }}
                className="btn-secondary"
                style={{height:44}}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16}}>
        {goals.length === 0 && (
          <div className="glass-card" style={{padding:48, textAlign:"center", gridColumn:"1/-1"}}>
            <div style={{fontSize:48, marginBottom:12}}>🎯</div>
            <p style={{color:"var(--text-muted)", fontSize:14}}>No goals yet. Add your first study goal above!</p>
          </div>
        )}
        {goals.map((goal, i) => {
          const daysLeft = getDaysLeft(goal.due_date);
          const pct = Number(goal.progress || 0);
          const ringColor = ringColors[i % ringColors.length];
          const bgGrad = gradients[i % gradients.length];
          return (
            <div
              key={goal.id}
              className="goal-card"
              style={{background: bgGrad}}
            >
              {/* Top bar */}
              <div style={{display:"flex", alignItems:"flex-start", gap:16, marginBottom:16}}>
                <div style={{position:"relative", flexShrink:0}}>
                  <ProgressRing percent={pct} size={80} stroke={7} color={ringColor}/>
                  <div style={{
                    position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:800, color:ringColor,
                  }}>
                    {pct}%
                  </div>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <h3 style={{fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:6, lineHeight:1.3}}>
                    {goal.title}
                  </h3>
                  {daysLeft !== null && (
                    <span style={{
                      fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99,
                      background: daysLeft < 0 ? "rgba(244,63,94,0.2)" : daysLeft < 3 ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
                      color: daysLeft < 0 ? "#f43f5e" : daysLeft < 3 ? "#f59e0b" : "#10b981",
                    }}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due Today!" : `${daysLeft}d left`}
                    </span>
                  )}
                  {goal.due_date && (
                    <p style={{fontSize:11, color:"var(--text-muted)", marginTop:4}}>
                      📅 {goal.due_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{background:"rgba(255,255,255,0.06)", borderRadius:99, height:5, overflow:"hidden", marginBottom:12}}>
                <div style={{
                  width:`${pct}%`, height:"100%", borderRadius:99, transition:"width 0.8s ease",
                  background:`linear-gradient(90deg,${ringColor},${ringColor}aa)`,
                }}/>
              </div>

              {/* Quick progress buttons */}
              <div style={{display:"flex", gap:6, marginBottom:14, flexWrap:"wrap"}}>
                {[25, 50, 75, 100].map(v => (
                  <button
                    key={v}
                    onClick={() => setQuickProgress(goal.id, v)}
                    style={{
                      padding:"4px 10px", borderRadius:99, fontSize:11, fontWeight:600,
                      cursor:"pointer", transition:"all 0.2s",
                      background: pct >= v ? `${ringColor}30` : "rgba(255,255,255,0.06)",
                      color: pct >= v ? ringColor : "var(--text-muted)",
                      border:`1px solid ${pct >= v ? ringColor+"50" : "var(--glass-border)"}`,
                    }}
                  >
                    {v}%
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                <button
                  onClick={() => {
                    setEditingGoalId(goal.id);
                    setGoalTitle(goal.title);
                    setDueDate(goal.due_date || "");
                    setProgress(goal.progress || 0);
                    window.scrollTo({top:0, behavior:"smooth"});
                  }}
                  className="btn-secondary"
                  style={{padding:"6px 14px", fontSize:12}}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="btn-danger"
                  style={{padding:"6px 14px", fontSize:12}}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
