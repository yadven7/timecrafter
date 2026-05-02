import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { apiGet, apiPost, apiPatch, apiDelete } from "./api";
import Dashboard from "./components/Dashboard";
import TaskManager from "./components/TaskManager";
import GoalSection from "./components/GoalSection";
import PomodoroTimer from "./components/PomodoroTimer";
import Chatbot from "./components/Chatbot";
import SmartScheduler from "./components/SmartScheduler";

/* ─── Nav Config ────────────────────────────────── */
const NAV = [
  { id: "Dashboard", icon: "📊", label: "Dashboard" },
  { id: "Tasks", icon: "✅", label: "Tasks" },
  { id: "Goals", icon: "🎯", label: "Goals" },
  { id: "Pomodoro", icon: "🍅", label: "Pomodoro" },
  { id: "Chatbot", icon: "🤖", label: "AI Chat" },
  { id: "Scheduler", icon: "📅", label: "Scheduler" },
];

const LOCAL_QUOTES = [
  "Small progress is still progress.",
  "Consistency beats intensity.",
  "Study now, shine later.",
  "Discipline bridges goals and success.",
  "One focused hour can change your day.",
  "Focus on progress, not perfection.",
];

/* ─── Digit component for clock ─────────────────── */
function DigitalDigit({ value }) {
  const [display, setDisplay] = useState(value);
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    if (value !== display) {
      setDisplay(value);
      setAnim(true);
      const t = setTimeout(() => setAnim(false), 220);
      return () => clearTimeout(t);
    }
  }, [value, display]);
  return (
    <div className="digital-digit">
      <span className={`digital-digit-text${anim ? " digit-change" : ""}`}>{display}</span>
    </div>
  );
}

function DigitalClock({ currentTime }) {
  const H = String(currentTime.getHours()).padStart(2, "0");
  const M = String(currentTime.getMinutes()).padStart(2, "0");
  const S = String(currentTime.getSeconds()).padStart(2, "0");
  const ap = currentTime.getHours() >= 12 ? "PM" : "AM";
  const wd = currentTime.toLocaleDateString([], { weekday: "short" }).toUpperCase();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return (
    <div className="digital-clock-wrapper" style={{ transform: "scale(0.75)", transformOrigin: "top right" }}>
      <div className="digital-clock-card">
        <div className="digital-clock-days">
          {days.map(d => <span key={d} className={d === wd ? "digital-day active" : "digital-day"}>{d}</span>)}
        </div>
        <div className="digital-clock-main">
          <div className="digital-time-group">
            <DigitalDigit value={H[0]} /><DigitalDigit value={H[1]} />
          </div>
          <div className="digital-colon">:</div>
          <div className="digital-time-group">
            <DigitalDigit value={M[0]} /><DigitalDigit value={M[1]} />
          </div>
          <div className="digital-colon">:</div>
          <div className="digital-time-group">
            <DigitalDigit value={S[0]} /><DigitalDigit value={S[1]} />
          </div>
          <div className="digital-ampm">{ap}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Quote Banner ───────────────────────────────── */
function QuoteBanner({ quote, showPreviousQuote, showNextQuote }) {
  return (
    <div className="quote-banner">
      <button onClick={showPreviousQuote} style={{ background: "none", border: "none", color: "var(--purple-light)", cursor: "pointer", fontSize: 16, padding: "0 8px", flexShrink: 0 }}>‹</button>
      <p className="quote-text">✨ {quote || "Craft your time. Master your goals."}</p>
      <button onClick={showNextQuote} style={{ background: "none", border: "none", color: "var(--purple-light)", cursor: "pointer", fontSize: 16, padding: "0 8px", flexShrink: 0 }}>›</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Main App
═══════════════════════════════════════════════════ */
function App() {
  /* ─── Auth ─────────────── */
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");

  /* ─── UI State ─────────── */
  const [showSplash, setShowSplash] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ─── Tasks ────────────── */
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");

  /* ─── Goals ────────────── */
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [editingGoalId, setEditingGoalId] = useState(null);

  /* ─── Pomodoro ─────────── */
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [isPomodoroLoaded, setIsPomodoroLoaded] = useState(false);

  /* ─── Quote ────────────── */
  const [quote, setQuote] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  /* ─── Chat ─────────────── */
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([{
    sender: "bot",
    text: "Namaste! Ask me anything — explain concepts, build a study plan, or prep for exams.",
  }]);
  const [chatLoading, setChatLoading] = useState(false);

  /* ══ Effects ══════════════════════════════════════ */
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    })();
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user || null));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) { fetchTasks(); fetchGoals(); fetchPomodoroSettings(); }
  }, [user]);

  useEffect(() => {
    if (activePage === "Goals") fetchRandomQuote();
  }, [activePage]);

  useEffect(() => {
    const handler = (e) => {
      if (activePage !== "Goals") return;
      if (e.key === "ArrowRight") showNextQuote();
      if (e.key === "ArrowLeft") showPreviousQuote();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activePage, quoteIndex]);

  /* ── Pomodoro persistence ── */
  useEffect(() => {
    const saved = localStorage.getItem("pomodoroState");
    if (saved) {
      const p = JSON.parse(saved);
      const sf = Number(p.focusMinutes ?? 25);
      const sb = Number(p.breakMinutes ?? 5);
      setFocusMinutes(sf); setBreakMinutes(sb);
      setIsBreak(p.isBreak ?? false);
      setSessionsCompleted(Number(p.sessionsCompleted ?? 0));
      if (p.endTime && p.isRunning) {
        const rem = Math.max(0, Math.floor((p.endTime - Date.now()) / 1000));
        if (rem > 0) { setTimeLeft(rem); setEndTime(p.endTime); setIsRunning(true); }
        else { setTimeLeft(sf * 60); }
      } else { setTimeLeft(Number(p.timeLeft ?? sf * 60)); }
    }
    setIsPomodoroLoaded(true);
  }, []);

  useEffect(() => {
    if (!isPomodoroLoaded) return;
    localStorage.setItem("pomodoroState", JSON.stringify({
      focusMinutes, breakMinutes, timeLeft, isRunning, isBreak, sessionsCompleted, endTime,
    }));
  }, [isPomodoroLoaded, focusMinutes, breakMinutes, timeLeft, isRunning, isBreak, sessionsCompleted, endTime]);

  useEffect(() => {
    if (!isRunning || !endTime) return;
    const id = setInterval(() => {
      const rem = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(id);
        if (!isBreak) {
          setIsBreak(true);
          setEndTime(Date.now() + Number(breakMinutes) * 60000);
          setSessionsCompleted(prev => {
            const updated = prev + 1;
            if (user) {
              apiPost("/pomodoro_sessions", { sessions_completed: updated }).catch(console.error);
            }
            return updated;
          });
          setTimeLeft(Number(breakMinutes) * 60);
        } else {
          setIsBreak(false);
          setEndTime(Date.now() + Number(focusMinutes) * 60000);
          setTimeLeft(Number(focusMinutes) * 60);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, endTime, isBreak, focusMinutes, breakMinutes]);

  /* ══ Data Handlers ════════════════════════════════ */
  const fetchTasks = async () => {
    if (!user) return;
    try {
      const data = await apiGet("/tasks");
      setTasks(data.map(t => ({ ...t, done: t.completed })) || []);
    } catch (err) { console.error("Error fetching tasks:", err); }
  };

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const data = await apiGet("/goals");
      setGoals(data || []);
    } catch (err) { console.error("Error fetching goals:", err); }
  };

  const fetchPomodoroSettings = async () => {
    if (!user) return;
    try {
      const data = await apiGet("/pomodoro_sessions");
      if (data) {
        setFocusMinutes(data.focus_minutes || 25);
        setBreakMinutes(data.break_minutes || 5);
        setSessionsCompleted(data.sessions_completed || 0);
        setTimeLeft(Number(data.focus_minutes || 25) * 60);
      }
    } catch (err) { console.error("Error fetching pomodoro settings:", err); }
  };

  const addTask = async () => {
    if (!title.trim() || !user) return;
    try {
      await apiPost("/tasks", { title, priority, completed: false });
      setTitle(""); setPriority("Medium"); fetchTasks();
    } catch (err) { console.error("Error adding task:", err); }
  };

  const completeTask = async (id) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    try {
      await apiPatch(`/tasks/${id}`, { title: t.title, priority: t.priority || "Medium", completed: true });
      fetchTasks();
    } catch (err) { console.error("Error completing task:", err); }
  };

  const deleteTask = async (id) => {
    try {
      await apiDelete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) { console.error("Error deleting task:", err); }
  };

  const addGoal = async () => {
    if (!goalTitle.trim() || !user) return;
    try {
      await apiPost("/goals", { title: goalTitle, due_date: dueDate || null, progress: Number(progress) });
      setGoalTitle(""); setDueDate(""); setProgress(0); fetchGoals();
    } catch (err) { console.error("Error adding goal:", err); }
  };

  const updateGoal = async () => {
    if (!goalTitle.trim() || !editingGoalId || !user) return;
    try {
      await apiPatch(`/goals/${editingGoalId}`, { title: goalTitle, due_date: dueDate || null, progress: Number(progress) });
      setGoalTitle(""); setDueDate(""); setProgress(0); setEditingGoalId(null); fetchGoals();
    } catch (err) { console.error("Error updating goal:", err); }
  };

  /* ── Pomodoro controls ── */
  const startTimer = () => {
    const dur = isBreak ? Number(breakMinutes) * 60 : Number(focusMinutes) * 60;
    const rem = timeLeft > 0 ? Number(timeLeft) : dur;
    setEndTime(Date.now() + rem * 1000); setIsRunning(true);
  };
  const pauseTimer = () => {
    if (endTime) setTimeLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    setIsRunning(false); setEndTime(null);
  };
  const resetTimer = () => { setIsRunning(false); setIsBreak(false); setEndTime(null); setTimeLeft(Number(focusMinutes) * 60); };
  const applyCustomTime = async () => {
    setIsRunning(false); setIsBreak(false); setEndTime(null); setTimeLeft(Number(focusMinutes) * 60);
    if (user) {
      apiPost("/pomodoro_sessions", { focus_minutes: Number(focusMinutes), break_minutes: Number(breakMinutes), sessions_completed: Number(sessionsCompleted) }).catch(console.error);
    }
  };

  /* ── Quote ── */
  const fetchRandomQuote = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/quote/random");
      const data = await res.json();
      setQuote(data.quote);
    } catch {
      setQuote(LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)]);
    }
  };
  const showNextQuote = () => {
    const i = (quoteIndex + 1) % LOCAL_QUOTES.length;
    setQuoteIndex(i); setQuote(LOCAL_QUOTES[i]);
  };
  const showPreviousQuote = () => {
    const i = quoteIndex === 0 ? LOCAL_QUOTES.length - 1 : quoteIndex - 1;
    setQuoteIndex(i); setQuote(LOCAL_QUOTES[i]);
  };

  /* ── Chat ── */
  const sendChatMessage = async (overrideMessage = null) => {
    const msg = overrideMessage || chatInput.trim();
    if (!msg || chatLoading) return;

    setChatMessages(prev => [...prev, { sender: "user", text: msg }]);
    if (!overrideMessage) setChatInput("");
    setChatLoading(true);

    try {
      const data = await apiPost("/ai/agent", { message: msg });
      setChatMessages(prev => [...prev, { sender: "bot", text: data.reply || data.message || "No reply." }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: "bot", text: "Connection error. Check backend and try again." }]);
    } finally { setChatLoading(false); }
  };

  const optimizeMyDay = () => {
    sendChatMessage("Optimize my schedule based on my tasks and goals");
  };

  /* ── Auth ── */
  const handleAuth = async () => {
    if (!authEmail || !authPassword) return;
    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
      else alert("Signup successful! Check your email if confirmation is enabled.");
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) alert(error.message);
      else if (data?.user) setUser(data.user);
    }
  };

  const handleGuestLogin = () => {
    setUser({ id: "guest-user", email: "guest@timecrafter.app" });
  };
  const logout = async () => supabase.auth.signOut();

  /* ══ Splash Screen ════════════════════════════════ */
  if (showSplash) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.25) 0%, #080b14 65%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Floating orbs */}
      {[
        { w: 300, h: 300, top: "10%", left: "5%", color: "rgba(139,92,246,0.08)" },
        { w: 200, h: 200, top: "60%", right: "8%", color: "rgba(59,130,246,0.08)" },
        { w: 150, h: 150, bottom: "15%", left: "20%", color: "rgba(6,182,212,0.06)" },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute", width: o.w, height: o.h,
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          borderRadius: "50%", background: o.color,
          filter: "blur(40px)", animation: "glowPulse 3s ease-in-out infinite",
          animationDelay: `${i * 0.8}s`,
        }} />
      ))}
      <div className="text-center splash-animate" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 88, height: 88, borderRadius: 28, margin: "0 auto 24px",
          background: "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(59,130,246,0.2))",
          border: "1px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 42, backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px rgba(139,92,246,0.3)",
        }}>⏳</div>
        <h1 className="brand-glow" style={{ fontSize: 60, fontWeight: 900, marginBottom: 12 }}>TimeCrafter</h1>
        <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 32 }}>Craft your time. Master your goals.</p>
        <div style={{
          width: 200, height: 3, margin: "0 auto", borderRadius: 99,
          background: "rgba(255,255,255,0.08)", overflow: "hidden",
        }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#8b5cf6,#3b82f6,#06b6d4)", animation: "shimmer 1.6s infinite linear", backgroundSize: "400px 100%" }} />
        </div>
      </div>
    </div>
  );

  /* ══ Auth Screen ══════════════════════════════════ */
  if (!user) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.18) 0%, #080b14 60%)",
    }}>
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px",
            background: "linear-gradient(135deg,#8b5cf6,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
          }}>⏳</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>TimeCrafter</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {authMode === "login" ? "Welcome back! Sign in to continue." : "Create your account to get started."}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
            <input id="auth-email" type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              placeholder="you@example.com" className="tc-input" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
            <input id="auth-password" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAuth()}
              placeholder="••••••••" className="tc-input" />
          </div>
          <button id="auth-submit-btn" onClick={handleAuth} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 14, marginTop: 4 }}>
            {authMode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <button id="guest-login-btn" onClick={handleGuestLogin} className="btn-secondary" style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 14 }}>
            Continue as Guest 🚀
          </button>

          <button onClick={() => setAuthMode(m => m === "login" ? "signup" : "login")} style={{
            background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
            fontSize: 13, textAlign: "center", padding: "4px", marginTop: 8
          }}>
            {authMode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );

  /* ══ Main App Layout ══════════════════════════════ */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`sidebar${sidebarOpen ? " expanded" : ""}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-logo" style={{ marginBottom: 28, padding: "0 20px" }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <span style={{ marginLeft: 10 }}>TimeCrafter</span>
        </div>

        <nav style={{ flex: 1, width: "100%" }}>
          {NAV.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id.toLowerCase()}`}
              onClick={() => setActivePage(item.id)}
              className={`nav-item${activePage === item.id ? " active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: "0 12px", paddingBottom: 16, width: "100%" }}>
          <button
            onClick={logout}
            className="nav-item"
            style={{ width: "100%", background: "rgba(244,63,94,0.08)", color: "#f43f5e", borderRadius: 12 }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Quote Banner */}
        <QuoteBanner quote={quote} showPreviousQuote={showPreviousQuote} showNextQuote={showNextQuote} />

        {/* Top Bar */}
        <div style={{
          padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--border)", background: "rgba(13,17,32,0.6)", backdropFilter: "blur(20px)",
        }}>
          <div>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              👤 {user?.email?.split("@")[0]}
            </span>
          </div>
          <DigitalClock currentTime={currentTime} />
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", paddingBottom: 80 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            {activePage === "Dashboard" && (
              <Dashboard tasks={tasks} goals={goals} sessionsCompleted={sessionsCompleted} />
            )}
            {activePage === "Tasks" && (
              <TaskManager
                tasks={tasks} title={title} setTitle={setTitle}
                priority={priority} setPriority={setPriority}
                filter={filter} setFilter={setFilter}
                addTask={addTask} completeTask={completeTask} deleteTask={deleteTask}
              />
            )}
            {activePage === "Goals" && (
              <GoalSection
                goals={goals} goalTitle={goalTitle} setGoalTitle={setGoalTitle}
                dueDate={dueDate} setDueDate={setDueDate}
                progress={progress} setProgress={setProgress}
                editingGoalId={editingGoalId} setEditingGoalId={setEditingGoalId}
                addGoal={addGoal} updateGoal={updateGoal} fetchGoals={fetchGoals} user={user}
                quote={quote} showPreviousQuote={showPreviousQuote} showNextQuote={showNextQuote}
              />
            )}
            {activePage === "Pomodoro" && (
              <PomodoroTimer
                timeLeft={timeLeft} isRunning={isRunning} isBreak={isBreak}
                sessionsCompleted={sessionsCompleted}
                focusMinutes={focusMinutes} setFocusMinutes={setFocusMinutes}
                breakMinutes={breakMinutes} setBreakMinutes={setBreakMinutes}
                startTimer={startTimer} pauseTimer={pauseTimer}
                resetTimer={resetTimer} applyCustomTime={applyCustomTime}
              />
            )}
            {activePage === "Chatbot" && (
              <Chatbot
                chatMessages={chatMessages} chatInput={chatInput}
                setChatInput={setChatInput} sendChatMessage={sendChatMessage}
                chatLoading={chatLoading} optimizeMyDay={optimizeMyDay}
              />
            )}
            {activePage === "Scheduler" && <SmartScheduler />}
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav" style={{ display: "none" }} id="mobile-bottom-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            id={`mobile-nav-${item.id.toLowerCase()}`}
            onClick={() => setActivePage(item.id)}
            className={`bottom-nav-item${activePage === item.id ? " active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;