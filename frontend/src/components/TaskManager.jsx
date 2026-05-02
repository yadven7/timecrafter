import React, { useState, useEffect } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "../api";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");

  const priorityConfig = {
    None:   { cls: "badge-none",   label: "None" },
    Low:    { cls: "badge-low",    label: "Low" },
    Medium: { cls: "badge-medium", label: "Medium" },
    High:   { cls: "badge-high",   label: "High" },
    Urgent: { cls: "badge-urgent", label: "Urgent" },
  };
  const priorityRank = { Urgent:5, High:4, Medium:3, Low:2, None:1 };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiGet("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const newTask = await apiPost("/tasks", { title, priority, completed: false });
      setTasks(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [newTask, ...safePrev];
      });
      setTitle("");
      setPriority("Medium");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const completeTask = async (id) => {
    try {
      const safeTasks = Array.isArray(tasks) ? tasks : [];
      const t = safeTasks.find(x => x.id === id);
      if (!t) return;
      
      // Update DB
      await apiPatch(`/tasks/${id}`, { completed: !t.completed });
      
      // Update UI
      setTasks(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
      });
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      // Update DB
      await apiDelete(`/tasks/${id}`);
      
      // Update UI
      setTasks(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.filter(t => t.id !== id);
      });
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Safe fallback to prevent blank screen map/filter crashes
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = safeTasks
    .filter(t => filter === "All" ? true : filter === "Pending" ? !t.completed : t.completed)
    .sort((a,b) => priorityRank[b.priority] - priorityRank[a.priority]);

  const completedCount = safeTasks.filter(t => t.completed).length;
  const total     = safeTasks.length;
  const pct       = total === 0 ? 0 : Math.round(completedCount / total * 100);

  return (
    <div className="fade-in-up">
      <div className="section-header">
        <h1 className="gradient-text">Task Manager</h1>
        <p>Organize, prioritize and crush your study tasks.</p>
      </div>

      {/* Progress Bar */}
      <div className="glass-card" style={{padding:"20px 24px", marginBottom:20}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
          <span style={{fontSize:13, color:"var(--text-muted)", fontWeight:500}}>Overall Completion</span>
          <span style={{fontSize:13, fontWeight:700, color:"var(--emerald)"}}>{completedCount}/{total} tasks · {pct}%</span>
        </div>
        <div style={{background:"rgba(255,255,255,0.06)", borderRadius:99, height:6, overflow:"hidden"}}>
          <div style={{width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#10b981,#06b6d4)", borderRadius:99, transition:"width 0.6s ease"}}/>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="glass-card" style={{padding:24, marginBottom:24}}>
        <h2 style={{fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:16}}>➕ Add New Task</h2>
        <div style={{display:"grid", gridTemplateColumns:"1fr auto auto", gap:12, alignItems:"center"}}>
          <input
            id="task-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="What needs to be done? (press Enter)"
            className="tc-input"
          />
          <select
            id="task-priority-select"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="tc-input"
            style={{width:130}}
          >
            {Object.keys(priorityConfig).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button id="add-task-btn" onClick={addTask} className="btn-primary" style={{whiteSpace:"nowrap"}}>
            Add Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8}}>
        <h2 style={{fontSize:16, fontWeight:700, color:"var(--text-primary)"}}>Your Tasks</h2>
        <div style={{display:"flex", gap:6}}>
          {["All","Pending","Completed"].map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              style={{
                padding:"6px 16px",
                borderRadius:99,
                fontSize:12,
                fontWeight:600,
                cursor:"pointer",
                transition:"all 0.2s",
                border: filter === f ? "1px solid var(--purple)" : "1px solid var(--glass-border)",
                background: filter === f ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.04)",
                color: filter === f ? "var(--purple-light)" : "var(--text-muted)",
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {filteredTasks.length === 0 && (
          <div className="glass-card" style={{padding:40, textAlign:"center"}}>
            <div style={{fontSize:40, marginBottom:12}}>🎉</div>
            <p style={{color:"var(--text-muted)", fontSize:14}}>
              {filter === "Completed" ? "No completed tasks yet." : "No tasks here. Add one above!"}
            </p>
          </div>
        )}
        {filteredTasks.map(task => (
          <div key={task.id} className="task-item" style={{opacity: task.completed ? 0.65 : 1}}>
            <div style={{display:"flex", alignItems:"center", gap:12, flex:1}}>
              <button
                onClick={() => completeTask(task.id)}
                style={{
                  width:22, height:22, borderRadius:6, border:"2px solid",
                  borderColor: task.completed ? "var(--emerald)" : "var(--glass-border)",
                  background: task.completed ? "var(--emerald)" : "transparent",
                  cursor: "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0, transition:"all 0.2s",
                }}
              >
                {task.completed && <span style={{color:"#fff", fontSize:12}}>✓</span>}
              </button>
              <div>
                <p style={{
                  fontSize:14, fontWeight:500, color:"var(--text-primary)",
                  textDecoration: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.6 : 1,
                }}>
                  {task.title}
                </p>
                <span className={`badge badge-${(task.priority||"none").toLowerCase()}`} style={{marginTop:4, display:"inline-block"}}>
                  {task.priority || "None"}
                </span>
              </div>
            </div>
            <div style={{display:"flex", gap:8, flexShrink:0}}>
              {!task.completed && (
                <button onClick={() => completeTask(task.id)} className="btn-success">Done</button>
              )}
              <button onClick={() => deleteTask(task.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
