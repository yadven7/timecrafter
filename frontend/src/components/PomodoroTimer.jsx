export default function PomodoroTimer({
  timeLeft, isRunning, isBreak, sessionsCompleted,
  focusMinutes, setFocusMinutes, breakMinutes, setBreakMinutes,
  startTimer, pauseTimer, resetTimer, applyCustomTime,
}) {
  const totalSeconds = isBreak ? Number(breakMinutes) * 60 : Number(focusMinutes) * 60;
  const progress     = totalSeconds === 0 ? 0 : ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const SIZE         = 260;
  const STROKE       = 14;
  const radius       = (SIZE - STROKE) / 2;
  const circ         = 2 * Math.PI * radius;
  const offset       = circ - (progress / 100) * circ;

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  const modeColor  = isBreak ? "#10b981" : "#8b5cf6";
  const modeGlow   = isBreak ? "0 0 40px rgba(16,185,129,0.4)" : "0 0 40px rgba(139,92,246,0.5)";
  const modeLabel  = isBreak ? "☕ Break Time" : "🎯 Focus Session";

  return (
    <div className="fade-in-up">
      <div className="section-header">
        <h1 className="gradient-text">Pomodoro Timer</h1>
        <p>Deep work in focused sprints. Stay in the zone.</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:24, alignItems:"start"}}>

        {/* Main Timer Card */}
        <div className="glass-card" style={{padding:40, textAlign:"center"}}>
          {/* Mode badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background: isBreak ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.15)",
            border:`1px solid ${modeColor}40`,
            borderRadius:99, padding:"6px 18px", marginBottom:32, fontSize:13, fontWeight:600, color:modeColor,
          }}>
            <span style={{width:7,height:7,borderRadius:"50%",background:modeColor, boxShadow:`0 0 8px ${modeColor}`, display:"inline-block"}}/>
            {modeLabel}
          </div>

          {/* SVG Ring Timer */}
          <div className="pomodoro-ring" style={{marginBottom:32}}>
            <svg width={SIZE} height={SIZE} className="timer-glow" style={{filter:`drop-shadow(${modeGlow})`}}>
              {/* Background track */}
              <circle
                cx={SIZE/2} cy={SIZE/2} r={radius}
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE}
              />
              {/* Progress arc */}
              <circle
                cx={SIZE/2} cy={SIZE/2} r={radius}
                fill="none" stroke={modeColor} strokeWidth={STROKE}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
                style={{transition:"stroke-dashoffset 1s linear"}}
              />
              {/* Inner glow ring */}
              <circle
                cx={SIZE/2} cy={SIZE/2} r={radius - STROKE - 8}
                fill="none" stroke={`${modeColor}10`} strokeWidth={2}
              />
            </svg>
            {/* Time overlay */}
            <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
              <span style={{fontFamily:"'Orbitron',sans-serif", fontSize:48, fontWeight:800, color:"var(--text-primary)", letterSpacing:"0.04em", lineHeight:1}}>
                {formatTime(timeLeft)}
              </span>
              <span style={{fontSize:12, color:"var(--text-muted)", marginTop:6, fontWeight:500}}>
                {Math.round(progress)}% elapsed
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap"}}>
            {!isRunning ? (
              <button id="start-timer-btn" onClick={startTimer} className="btn-primary" style={{padding:"14px 36px", fontSize:15, borderRadius:16}}>
                ▶ Start
              </button>
            ) : (
              <button id="pause-timer-btn" onClick={pauseTimer} className="btn-secondary" style={{padding:"14px 36px", fontSize:15, borderRadius:16}}>
                ⏸ Pause
              </button>
            )}
            <button id="reset-timer-btn" onClick={resetTimer} className="btn-danger" style={{padding:"14px 28px", fontSize:15, borderRadius:16}}>
              ↺ Reset
            </button>
          </div>

          {/* Sessions row */}
          <div style={{marginTop:28, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap"}}>
            {Array.from({length: Math.max(4, sessionsCompleted)}).map((_, i) => (
              <div key={i} style={{
                width:10, height:10, borderRadius:"50%",
                background: i < sessionsCompleted ? "#8b5cf6" : "rgba(255,255,255,0.08)",
                boxShadow: i < sessionsCompleted ? "0 0 8px rgba(139,92,246,0.7)" : "none",
                transition:"all 0.3s",
              }}/>
            ))}
            <span style={{fontSize:12, color:"var(--text-muted)", marginLeft:8}}>
              {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""} completed
            </span>
          </div>
        </div>

        {/* Settings Panel */}
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          <div className="glass-card" style={{padding:24}}>
            <h2 style={{fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:20}}>⚙️ Settings</h2>
            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <div>
                <label style={{fontSize:12, color:"var(--text-muted)", fontWeight:600, display:"block", marginBottom:8}}>
                  Focus Duration (minutes)
                </label>
                <input
                  id="focus-minutes-input"
                  type="number" min="1" max="90"
                  value={focusMinutes}
                  onChange={e => setFocusMinutes(e.target.value)}
                  className="tc-input"
                />
              </div>
              <div>
                <label style={{fontSize:12, color:"var(--text-muted)", fontWeight:600, display:"block", marginBottom:8}}>
                  Break Duration (minutes)
                </label>
                <input
                  id="break-minutes-input"
                  type="number" min="1" max="30"
                  value={breakMinutes}
                  onChange={e => setBreakMinutes(e.target.value)}
                  className="tc-input"
                />
              </div>
              <button id="apply-time-btn" onClick={applyCustomTime} className="btn-primary" style={{width:"100%"}}>
                Apply Settings
              </button>
            </div>
          </div>

          {/* Sessions Badge */}
          <div className="glass-card" style={{padding:24, textAlign:"center", background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.1))"}}>
            <p style={{fontSize:12, color:"var(--text-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8}}>Total Focus Sessions</p>
            <div style={{fontSize:56, fontWeight:900, color:"var(--purple-light)", lineHeight:1, marginBottom:4, fontFamily:"'Orbitron',sans-serif"}}>
              {sessionsCompleted}
            </div>
            <p style={{fontSize:12, color:"var(--text-muted)"}}>~{sessionsCompleted * Number(focusMinutes)} minutes of deep work</p>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{padding:20}}>
            <p style={{fontSize:12, fontWeight:700, color:"var(--text-primary)", marginBottom:10}}>💡 Pomodoro Tips</p>
            {[
              "Work 25 min, break 5 min",
              "After 4 sessions, take 15–30 min break",
              "Remove distractions during focus time",
              "Review what you accomplished each session",
            ].map((tip, i) => (
              <p key={i} style={{fontSize:12, color:"var(--text-muted)", lineHeight:1.7, padding:"4px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none"}}>
                {i + 1}. {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
