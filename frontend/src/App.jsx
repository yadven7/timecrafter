import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

function App() {

      const [user, setUser] = useState(null);

    useEffect(() => {
      if (user) {
        fetchTasks();
        fetchGoals();
        fetchPomodoroSettings();
      }
    }, [user]);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [showSplash, setShowSplash] = useState(true);
  const [activePage, setActivePage] = useState("Tasks");
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [editingGoalId, setEditingGoalId] = useState(null);
  
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [isPomodoroLoaded, setIsPomodoroLoaded] = useState(false);
  

  // quotes

  const [quote, setQuote] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  // clock
  const [currentTime, setCurrentTime] = useState(new Date());

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
  {
    sender: "bot",
    text: "Namaste! Mujhse puchho: 'Explain DBMS normalization' ya 'Mujhe OS 1 din me complete karna hai'.",
  },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // API Fetches
  const fetchTasks = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!error) setTasks(data || []);
  };

const fetchGoals = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!error) setGoals(data || []);
};
  useEffect(() => {
  fetchTasks();
  fetchGoals();
  fetchRandomQuote();
  }, []);

  useEffect(() => {
  const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user || null);
  };



  getSession();

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user || null);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, 2500);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
  if (activePage === "Goals") {
    fetchRandomQuote();
  }
}, [activePage]);

  useEffect(() => {
  const handleKeyDown = (event) => {
    if (activePage !== "Goals") return;

    if (event.key === "ArrowRight") {
      showNextQuote();
    }

    if (event.key === "ArrowLeft") {
      showPreviousQuote();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
  }, [activePage, quoteIndex]);

    useEffect(() => {
    const savedPomodoro = localStorage.getItem("pomodoroState");

    if (savedPomodoro) {
      const parsed = JSON.parse(savedPomodoro);

      const savedFocus = Number(parsed.focusMinutes ?? 25);
      const savedBreak = Number(parsed.breakMinutes ?? 5);
      const savedIsBreak = parsed.isBreak ?? false;
      const savedSessions = Number(parsed.sessionsCompleted ?? 0);
      const savedEndTime = parsed.endTime ?? null;
      const savedIsRunning = parsed.isRunning ?? false;
      const savedTimeLeft = Number(parsed.timeLeft ?? 25 * 60);

      setFocusMinutes(savedFocus);
      setBreakMinutes(savedBreak);
      setIsBreak(savedIsBreak);
      setSessionsCompleted(savedSessions);

      if (savedEndTime && savedIsRunning) {
        const remaining = Math.max(
          0,
          Math.floor((savedEndTime - Date.now()) / 1000)
        );

        if (remaining > 0) {
          setTimeLeft(remaining);
          setEndTime(savedEndTime);
          setIsRunning(true);
        } else {
          const fallback = savedIsBreak ? savedBreak * 60 : savedFocus * 60;
          setTimeLeft(fallback);
          setEndTime(null);
          setIsRunning(false);
        }
      } else {
        setTimeLeft(savedTimeLeft);
        setEndTime(null);
        setIsRunning(false);
      }
    }

    setIsPomodoroLoaded(true);
  }, []);

  useEffect(() => {
    if (!isPomodoroLoaded) return;

    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({
        focusMinutes: Number(focusMinutes),
        breakMinutes: Number(breakMinutes),
        timeLeft,
        isRunning,
        isBreak,
        sessionsCompleted,
        endTime,
      })
    );
  }, [
    isPomodoroLoaded,
    focusMinutes,
    breakMinutes,
    timeLeft,
    isRunning,
    isBreak,
    sessionsCompleted,
    endTime,
  ]);

  

    useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const savePomodoroSettings = async () => {
  if (!user) return;

  await supabase
    .from("pomodoro_settings")
    .update({
      focus_minutes: Number(focusMinutes),
      break_minutes: Number(breakMinutes),
      sessions_completed: Number(sessionsCompleted),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);
};

    useEffect(() => {
    let interval = null;

    if (isRunning && endTime) {
      interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((endTime - Date.now()) / 1000)
        );

        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);

          if (!isBreak) {
            const newEndTime = Date.now() + Number(breakMinutes) * 60 * 1000;
            setIsBreak(true);
setSessionsCompleted((prev) => {
  const updated = prev + 1;

  if (user) {
    supabase
      .from("pomodoro_settings")
      .update({
        sessions_completed: updated,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  return updated;
});
            setTimeLeft(Number(breakMinutes) * 60);
          } else {
            const newEndTime = Date.now() + Number(focusMinutes) * 60 * 1000;
            setIsBreak(false);
            setEndTime(newEndTime);
            setTimeLeft(Number(focusMinutes) * 60);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, endTime, isBreak, focusMinutes, breakMinutes]);

  //flipclock 


  

  // Task Handlers
 const addTask = async () => {
  if (!title.trim() || !user) return;

  await supabase.from("tasks").insert({
    title,
    priority,
    done: false,
    user_id: user.id,
  });

  setTitle("");
  setPriority("Medium");
  fetchTasks();
};

 const completeTask = async (id) => {
  await supabase
    .from("tasks")
    .update({ done: true })
    .eq("id", id);

  fetchTasks();
};

const deleteTask = async (id) => {
  await supabase.from("tasks").delete().eq("id", id);
  fetchTasks();
};

  // Goal Handlers
  const addGoal = async () => {
  if (!goalTitle.trim() || !user) return;

  await supabase.from("goals").insert({
    title: goalTitle,
    due_date: dueDate,
    progress: Number(progress),
    user_id: user.id,
  });

  setGoalTitle("");
  setDueDate("");
  setProgress(0);
  fetchGoals();
};

  const deleteGoal = async (id) => {
    await fetch(`http://127.0.0.1:8000/goals/${id}`, { method: "DELETE" });
    fetchGoals();
  };
  const updateGoal = async () => {
  if (!goalTitle.trim() || !editingGoalId || !user) return;

  await supabase
    .from("goals")
    .update({
      title: goalTitle,
      due_date: dueDate,
      progress: Number(progress),
    })
    .eq("id", editingGoalId)
    .eq("user_id", user.id);

  setGoalTitle("");
  setDueDate("");
  setProgress(0);
  setEditingGoalId(null);
  fetchGoals();
};

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Pending") return !task.done;
    if (filter === "Completed") return task.done;
    return true;
  });

  const priorityColors = {
    None: "bg-gray-100 text-gray-700",
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-orange-100 text-orange-700",
    Urgent: "bg-red-100 text-red-700",
  };
const priorityRank = {
  Urgent: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  None: 1,
};
  const completedTasks = tasks.filter((t) => t.done).length;
const pendingTasks = tasks.filter((t) => !t.done).length;
const totalTasks = tasks.length;

const taskCompletionPercent =
  totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

const avgGoalProgress =
  goals.length === 0
    ? 0
    : Math.round(
        goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) /
          goals.length
      );

const productivityScore = Math.min(
  100,
  Math.round(
    taskCompletionPercent * 0.45 +
      avgGoalProgress * 0.35 +
      sessionsCompleted * 5
  )
);

const fetchPomodoroSettings = async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("pomodoro_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    await supabase.from("pomodoro_settings").insert({
      user_id: user.id,
      focus_minutes: 25,
      break_minutes: 5,
      sessions_completed: 0,
    });
    return;
  }

  setFocusMinutes(data.focus_minutes);
  setBreakMinutes(data.break_minutes);
  setSessionsCompleted(data.sessions_completed);
  setTimeLeft(Number(data.focus_minutes) * 60);
};

const pieData = [
  { name: "Completed", value: completedTasks },
  { name: "Pending", value: pendingTasks },
];

const barData = [
  { name: "Tasks", value: taskCompletionPercent },
  { name: "Goals", value: avgGoalProgress },
  { name: "Focus", value: Math.min(100, sessionsCompleted * 20) },
];
const weeklyData = [
  { day: "Mon", tasks: 2, focus: 1 },
  { day: "Tue", tasks: 1, focus: 2 },
  { day: "Wed", tasks: 3, focus: 1 },
  { day: "Thu", tasks: completedTasks, focus: sessionsCompleted },
  { day: "Fri", tasks: 0, focus: 0 },
  { day: "Sat", tasks: 0, focus: 0 },
  { day: "Sun", tasks: 0, focus: 0 },
];

const consistencyDays = Array.from({ length: 28 }).map((_, index) => {
  const dayNumber = index + 1;
  const activeLimit = Math.min(28, completedTasks + sessionsCompleted + goals.length);

  return {
    day: dayNumber,
    active: index < activeLimit,
  };
});

const pieColors = ["#10b981", "#f59e0b"];


const insight =
  productivityScore >= 75
    ? "Excellent focus! You are maintaining strong productivity."
    : productivityScore >= 45
    ? "Good progress. Complete pending tasks to boost your score."
    : "Start with small tasks and one Pomodoro session to build momentum.";

  const localQuotes = [
  "Small progress is still progress.",
  "Consistency beats intensity.",
  "Study now, shine later.",
  "Discipline is the bridge between goals and success.",
  "One focused hour can change your whole day.",
  "Focus on progress, not perfection.",
];

  const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
    
  const formatClockTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const sendChatMessage = async () => {
  if (!chatInput.trim() || chatLoading) return;

  const userMessage = chatInput.trim();

  setChatMessages((prev) => [
    ...prev,
    { sender: "user", text: userMessage },
  ]);
  setChatInput("");
  setChatLoading(true);

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const responseData = await res.json();

    setChatMessages((prev) => [
      ...prev,
      { sender: "bot", text: responseData.reply ||  responseData.message || "No reply received.",

       },
    ]);
  } catch (error) {
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "Chatbot error aaya. API key, backend, ya internet check karo.",
      },
    ]);
  } finally {
    setChatLoading(false);
  }
};

  const handleAuth = async () => {
  if (!authEmail || !authPassword) return;

  if (authMode === "signup") {
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });

    if (error) alert(error.message);
    else alert("Signup successful. Check email if confirmation is enabled.");
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) alert(error.message);
  }
};

const logout = async () => {
  await supabase.auth.signOut();
};

const fetchRandomQuote = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/quote/random");
    const data = await res.json();
    setQuote(data.quote);
  } catch (error) {
    setQuote(localQuotes[Math.floor(Math.random() * localQuotes.length)]);
  }
};

const showNextQuote = () => {
  const nextIndex = (quoteIndex + 1) % localQuotes.length;
  setQuoteIndex(nextIndex);
  setQuote(localQuotes[nextIndex]);
};

const showPreviousQuote = () => {
  const prevIndex =
    quoteIndex === 0 ? localQuotes.length - 1 : quoteIndex - 1;
  setQuoteIndex(prevIndex);
  setQuote(localQuotes[prevIndex]);
};

  const startTimer = () => {
    const defaultDuration = isBreak
      ? Number(breakMinutes) * 60
      : Number(focusMinutes) * 60;
    const remainingTime =
      timeLeft > 0 ? Number(timeLeft) : defaultDuration;

    const targetEndTime = Date.now() + remainingTime * 1000;

    setEndTime(targetEndTime);
    setIsRunning(true);
  };


  const pauseTimer = () => {
    if (endTime) {
      const remaining = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
    }

    setIsRunning(false);
    setEndTime(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setEndTime(null);
    setTimeLeft(Number(focusMinutes) * 60);
  };

const applyCustomTime = async () => {
  setIsRunning(false);
  setIsBreak(false);
  setEndTime(null);
  setTimeLeft(Number(focusMinutes) * 60);
  await savePomodoroSettings();
};

if (showSplash) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="text-center splash-animate">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-6xl shadow-2xl">
          ⏳
        </div>

        <h1 className="text-6xl font-black tracking-wide brand-glow">
  TimeCrafter
</h1>

        <p className="mt-4 text-lg text-indigo-200">
          Craft your time. Master your goals.
        </p>

        <div className="mx-auto mt-8 h-2 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-pulse bg-indigo-400"></div>
        </div>
      </div>
    </div>
  );
}

if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900 text-center">
          TimeCrafter
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Login to manage your tasks and productivity
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border px-4 py-3"
          />

          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border px-4 py-3"
          />

          <button
            onClick={handleAuth}
            className="w-full rounded-2xl bg-slate-900 py-3 font-medium text-white"
          >
            {authMode === "login" ? "Login" : "Create Account"}
          </button>

          <button
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
            className="w-full text-sm text-slate-600"
          >
            {authMode === "login"
              ? "New user? Create account"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      

      {/* Sidebar Section */}
      <div className="hidden md:flex w-full md:w-64 bg-white p-4 md:p-5 shadow-lg flex-col md:min-h-screen">
        <h2 className="text-2xl font-bold mb-8 text-slate-800">🚀 TimeCrafter ⏳</h2>
        <button
  onClick={logout}
  className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-white"
>
  Logout
</button>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-3 pb-2 md:pb-0">
          {["Dashboard", "Tasks", "Goals", "Pomodoro","Chatbot"].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`min-w-max md:w-full p-3 rounded-xl text-left font-medium transition ${
                activePage === page ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {page}
            </button>
            
          ))}
        </nav>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t border-slate-200 p-2 shadow-lg md:hidden">
  {["Dashboard", "Tasks", "Goals", "Pomodoro", "Chatbot"].map((page) => (
    <button
      key={page}
      onClick={() => setActivePage(page)}
      className={`rounded-xl px-3 py-2 text-xs font-medium ${
        activePage === page
          ? "bg-slate-900 text-white"
          : "text-slate-600"
      }`}
    >
      {page}
    </button>
  ))}
</div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 flex justify-end">
        <DigitalClock currentTime={currentTime} />
    </div>
          
          {/* DASHBOARD PAGE */}
          {activePage === "Dashboard" && (
  <div>
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-slate-800">
        Productivity Dashboard
      </h1>
      <p className="mt-2 text-slate-500">
        Track your tasks, goals, focus sessions and overall productivity.
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-4 mb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-3xl shadow-md">
        <p className="text-white/80 font-medium">Productivity Score</p>
        <h2 className="text-5xl font-bold mt-3 text-white drop-shadow-lg tracking-wide">{productivityScore}%</h2>
        <p className="text-sm text-slate-300 mt-2">{insight}</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <p className="text-slate-500 font-medium">Tasks Completed</p>
        <h2 className="text-4xl font-bold mt-2 text-emerald-600">
          {completedTasks}/{totalTasks}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {taskCompletionPercent}% completion
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <p className="text-slate-500 font-medium">Average Goal Progress</p>
        <h2 className="text-4xl font-bold mt-2 text-blue-600">
          {avgGoalProgress}%
        </h2>
        <p className="text-sm text-slate-400 mt-1">{goals.length} active goals</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <p className="text-slate-500 font-medium">Focus Sessions</p>
        <h2 className="text-4xl font-bold mt-2 text-purple-600">
          {sessionsCompleted}
        </h2>
        <p className="text-sm text-slate-400 mt-1">Pomodoro sessions</p>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-2 mb-8">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Task Completion
        </h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Productivity Breakdown
        </h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
  <BarChart data={barData}>
    <XAxis dataKey="name" />
    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
    <Tooltip formatter={(value) => `${value}%`} />
    <Bar dataKey="value" fill="#0f172a" radius={[10, 10, 0, 0]}>
      <LabelList dataKey="value" position="top" formatter={(value) => `${value}%`} />
    </Bar>
  </BarChart>
</ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-xl font-bold text-slate-800">Weekly Activity</h2>
      <p className="text-sm text-slate-500">
        Tasks completed and Pomodoro sessions across this week
      </p>
    </div>

    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
      This Week
    </span>
  </div>

  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={weeklyData}>
        <XAxis dataKey="day" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="tasks" fill="#10b981" radius={[8, 8, 0, 0]}>
          <LabelList dataKey="tasks" position="top" />
        </Bar>
        <Bar dataKey="focus" fill="#6366f1" radius={[8, 8, 0, 0]}>
          <LabelList dataKey="focus" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

  <div className="mt-4 flex gap-4 text-sm text-slate-500">
    <span>🟢 Tasks Completed</span>
    <span>🔵 Focus Sessions</span>
  </div>
</div>

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Consistency
        </h2>
        <div className="mb-3 flex items-center justify-between">
  <p className="text-sm font-medium text-slate-500">Last 4 Weeks</p>
  <p className="text-sm font-medium text-emerald-600">
    {consistencyDays.filter((day) => day.active).length}/28 active days
  </p>
</div>

<div className="grid grid-cols-7 gap-2">
  {consistencyDays.map((item) => (
    <div
      key={item.day}
      title={`Day ${item.day}: ${item.active ? "Active" : "No activity"}`}
      className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold ${
        item.active
          ? "bg-emerald-500 text-white"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {item.day}
    </div>
  ))}
</div>

<div className="mt-4 flex items-center justify-between text-xs text-slate-500">
  <span>Week 1</span>
  <span>Week 2</span>
  <span>Week 3</span>
  <span>Week 4</span>
</div>
        <p className="text-sm text-slate-500 mt-4">
  Green blocks represent days with completed tasks, focus sessions, or active goal progress.
</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Focus Insight
        </h2>
        <p className="text-slate-600 leading-7">
          You completed {sessionsCompleted} Pomodoro focus sessions. More
          focus sessions will increase your productivity score.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Next Best Action
        </h2>
        <p className="text-slate-600 leading-7">
          {pendingTasks > 0
            ? "Complete one pending high-priority task and run one Pomodoro session."
            : "Great! Add a new study goal or revise completed topics."}
        </p>
      </div>
    </div>
  </div>
)}

          {/* TASKS PAGE */}
          {activePage === "Tasks" && (
            <div>
              <div className="mb-8 rounded-3xl bg-white p-8 shadow-md">
                <h1 className="text-3xl font-bold text-slate-800">Study Tasks</h1>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_160px_140px]">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400"
                  />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    {Object.keys(priorityColors).map(p => <option key={p}>{p}</option>)}
                  </select>
                  <button onClick={addTask} className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700 sm:col-span-2 lg:col-span-1">
                    Add Task
                  </button>
                </div>
              </div>

              {/* Filters & List */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-700">Your List</h2>
                <div className="flex gap-2">
                  {["All", "Pending", "Completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 shadow-sm"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 sm:p-5 rounded-3xl shadow-sm hover:shadow-md transition">
                    <div>
                      <p className={`text-lg font-medium ${task.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</p>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${priorityColors[task.priority]}`}>{task.priority}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!task.done && <button onClick={() => completeTask(task.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-2xl text-sm">Done</button>}
                      <button onClick={() => deleteTask(task.id)} className="px-4 py-2 bg-rose-500 text-white rounded-2xl text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

{activePage === "Chatbot" && (
  <div className="flex flex-col h-[78vh] md:h-[85vh]">

    {/* Header */}
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-slate-800">
        Study Guidance Chatbot
      </h1>
      <p className="text-slate-500">
        Ask anything about your studies
      </p>
    </div>

    {/* Chat Area */}
    <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-50 p-5 space-y-5 border border-slate-200">

      {chatMessages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
              msg.sender === "user"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-800 border border-slate-200"
            }`}
          >
            <div className="whitespace-pre-line">
              {msg.text}
            </div>
          </div>
        </div>
      ))}

      {chatLoading && (
        <div className="flex justify-start">
          <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-white text-slate-500 border border-slate-200 text-sm">
            Generating study guidance...
          </div>
        </div>
      )}

    </div>

    {/* Input Area */}
    <div className="mt-4 flex flex-col sm:flex-row gap-3">
      <input
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendChatMessage();
        }}
        placeholder="Ask: explain a topic, make a study plan, give viva questions..."
        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
      />

      <button
        onClick={sendChatMessage}
        className="rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700 sm:w-auto"
      >
        Send
      </button>
    </div>

  </div>
)}
{/* GOALS PAGE */}
{activePage === "Goals" && (
  <div>
    <h1 className="text-3xl font-bold text-slate-800 mb-6">Study Goals</h1>

{/* Quote Card */}
<div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg border border-white/10">

  <div className="flex flex-col gap-4">

    {/* Heading */}
    <p className="text-sm uppercase tracking-[0.25em] text-white/60 text-center">
      Motivational Quote
    </p>

    {/* Quote */}
    <h2 className="text-xl md:text-2xl font-semibold text-center leading-snug neon-text transition-all duration-500">
      “{quote || "Stay focused and keep moving forward."}”
    </h2>

    {/* Controls */}
    <div className="flex justify-center items-center gap-4 mt-2">

      <button
        onClick={showPreviousQuote}
        className="rounded-full bg-white/20 p-2 px-3 text-white hover:bg-white/30 transition"
      >
        ←
      </button>

      <button
        onClick={showNextQuote}
        className="rounded-full bg-white/20 p-2 px-3 text-white hover:bg-white/30 transition"
      >
        →
      </button>

    </div>

    {/* Tip */}
    <p className="text-xs text-white/50 text-center mt-2">
      Auto updates every few seconds • Use ← → keys
    </p>

  </div>
</div>

    {/* Goal Form */}
    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-md mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
        <label className="text-sm font-medium text-slate-500 ml-1">
          Goal Name
        </label>
        <input
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          placeholder="e.g. Master React"
          className="rounded-xl border p-3 outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-500 ml-1">
          Deadline
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border p-3 outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-500 ml-1">
          Progress %
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          className="rounded-xl border p-3 outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={editingGoalId ? updateGoal : addGoal}
          className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-medium hover:bg-slate-700"
        >
          {editingGoalId ? "Update" : "Add"}
        </button>

        {editingGoalId && (
          <button
            onClick={() => {
              setEditingGoalId(null);
              setGoalTitle("");
              setDueDate("");
              setProgress(0);
            }}
            className="flex-1 bg-slate-200 text-slate-700 p-3 rounded-xl font-medium hover:bg-slate-300"
          >
            Cancel
          </button>
        )}
      </div>
    </div>

    {/* Goals List */}
    <div className="grid gap-4">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-800">
                {goal.title}
              </h3>

              <span className="text-sm font-semibold text-blue-600">
                {goal.progress || 0}%
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              Target Date: {goal.due_date || "Not set"}
            </p>

          <div className="mt-4 w-full max-w-md">

  {/* Progress Info */}
  <div className="flex justify-between text-sm font-medium mb-1">
    <span className="text-slate-600">Progress</span>
    <span className="text-blue-600">
      {goal.progress || 0}% completed
    </span>
  </div>

  {/* Progress Bar */}
  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
    <div
      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
      style={{ width: `${goal.progress || 0}%` }}
    ></div>
  </div>

</div>

            {/* Quick Progress Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[25, 50, 75, 100].map((value) => (
                <button
                  key={value}
                  onClick={async () => {
                    await supabase
                      .from("goals")
                      .update({ progress: value })
                      .eq("id", goal.id)
                      .eq("user_id", user.id);

                    fetchGoals();
                  }}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-blue-100 hover:text-blue-700"
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingGoalId(goal.id);
                setGoalTitle(goal.title);
                setDueDate(goal.due_date || "");
                setProgress(goal.progress || 0);
              }}
              className="text-blue-600 font-medium hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => deleteGoal(goal.id)}
              className="text-rose-500 font-medium hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
                    {activePage === "Pomodoro" && (
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-6">Pomodoro Timer</h1>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-md">
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    {isBreak ? "Break Session" : "Focus Session"}
                  </p>

                  <div className="flex items-center justify-center py-8">
                    <div className="w-64 h-64 rounded-full bg-slate-100 border-8 border-slate-200 flex items-center justify-center shadow-inner">
                      <span className="text-5xl font-bold text-slate-800">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    <button
                      onClick={startTimer}
                      className="px-5 py-3 rounded-2xl bg-emerald-500 text-white font-medium hover:bg-emerald-600"
                    >
                      Start
                    </button>

                    <button
                      onClick={pauseTimer}
                      className="px-5 py-3 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600"
                    >
                      Pause
                    </button>

                    <button
                      onClick={resetTimer}
                      className="px-5 py-3 rounded-2xl bg-rose-500 text-white font-medium hover:bg-rose-600"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-md">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-2">
                        Focus Minutes
                      </label>
                      <input
                        type="number"
                        value={focusMinutes}
                        onChange={(e) => setFocusMinutes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-2">
                        Break Minutes
                      </label>
                      <input
                        type="number"
                        value={breakMinutes}
                        onChange={(e) => setBreakMinutes(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                      />
                    </div>

                    <button
                      onClick={applyCustomTime}
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white font-medium hover:bg-slate-700"
                    >
                      Apply Time
                    </button>
                  </div>

                  <div className="mt-8 rounded-2xl bg-blue-50 p-4 border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium">Sessions Completed</p>
                    <h3 className="text-3xl font-bold text-blue-700 mt-2">
                      {sessionsCompleted}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DigitalDigit({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animate, setAnimate] = useState(false);

  const deleteTask = async (id) => {
  await supabase.from("tasks").delete().eq("id", id);
  fetchTasks();
};

  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value);
      setAnimate(true);

      const timer = setTimeout(() => {
        setAnimate(false);
      }, 220);

      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="digital-digit">
      <span className={`digital-digit-text ${animate ? "digit-change" : ""}`}>
        {displayValue}
      </span>
    </div>
  );
}

function DigitalClock({ currentTime }) {
  const hours = String(currentTime.getHours()).padStart(2, "0");
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getSeconds()).padStart(2, "0");

  const ampm = currentTime.getHours() >= 12 ? "PM" : "AM";

  const weekday = currentTime
    .toLocaleDateString([], { weekday: "short" })
    .toUpperCase();

  const [h1, h2] = hours.split("");
  const [m1, m2] = minutes.split("");
  const [s1, s2] = seconds.split("");

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="digital-clock-wrapper scale-[0.6] origin-top-right">
      <div className="digital-clock-card">
        <div className="digital-clock-days">
          {days.map((day) => (
            <span
              key={day}
              className={day === weekday ? "digital-day active" : "digital-day"}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="digital-clock-main">
          <div className="digital-time-group">
            <DigitalDigit value={h1} />
            <DigitalDigit value={h2} />
          </div>

          <div className="digital-colon">:</div>

          <div className="digital-time-group">
            <DigitalDigit value={m1} />
            <DigitalDigit value={m2} />
          </div>

          <div className="digital-colon">:</div>

          <div className="digital-time-group">
            <DigitalDigit value={s1} />
            <DigitalDigit value={s2} />
          </div>

          <div className="digital-ampm">{ampm}</div>
        </div>
      </div>
    </div>
  );
}

export default App;