import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { useState, useEffect } from "react";
import { apiPost } from "../api";

const COLORS = { pie: ["#10b981","#f59e0b"], bar: ["#8b5cf6","#3b82f6","#06b6d4"] };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"rgba(13,17,32,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"8px 14px",color:"#f1f5f9",fontSize:13}}>
      {label && <p style={{color:"#94a3b8",marginBottom:4}}>{label}</p>}
      {payload.map((p,i) => <p key={i} style={{color:p.color||"#a78bfa"}}>{p.name}: <b>{p.value}{typeof p.value==="number"&&p.value<=100?"%":""}</b></p>)}
    </div>
  );
};

export default function Dashboard({ tasks, goals, sessionsCompleted }) {
  const [aiInsight, setAiInsight] = useState("Loading AI insight...");

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await apiPost("/ai/agent", { message: "Give me a short productivity insight based on my data" });
        setAiInsight(res.reply || res.message || "Keep up the good work!");
      } catch (err) {
        setAiInsight("AI insight unavailable at the moment.");
      }
    };
    fetchInsight();
  }, []);

  const completed = tasks.filter(t=>t.done).length;
  const pending   = tasks.filter(t=>!t.done).length;
  const total     = tasks.length;
  const taskPct   = total===0?0:Math.round(completed/total*100);
  const avgGoal   = goals.length===0?0:Math.round(goals.reduce((s,g)=>s+Number(g.progress||0),0)/goals.length);
  const score     = Math.min(100,Math.round(taskPct*0.45+avgGoal*0.35+sessionsCompleted*5));
  const insight   = score>=75?"Excellent! You're crushing your goals 🎯":score>=45?"Good progress — keep pushing 💪":"Start small. One task + one Pomodoro 🚀";

  const pieData  = [{name:"Done",value:completed},{name:"Pending",value:pending}];
  const barData  = [{name:"Tasks",value:taskPct},{name:"Goals",value:avgGoal},{name:"Focus",value:Math.min(100,sessionsCompleted*20)}];
  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weekData = weekDays.map((day,i)=>({day,tasks:i===3?completed:i<3?Math.floor(Math.random()*3):0,focus:i===3?sessionsCompleted:i<3?Math.floor(Math.random()*2):0}));
  const heat     = Array.from({length:28},(_,i)=>({day:i+1,active:i<Math.min(28,completed+sessionsCompleted+goals.length)}));

  const statCards = [
    {label:"Productivity Score",value:`${score}%`,sub:insight,grad:"linear-gradient(135deg,#8b5cf6,#3b82f6)",icon:"⚡"},
    {label:"Tasks Completed",value:`${completed}/${total}`,sub:`${taskPct}% completion rate`,grad:"linear-gradient(135deg,#10b981,#06b6d4)",icon:"✅"},
    {label:"Goal Progress",value:`${avgGoal}%`,sub:`${goals.length} active goals`,grad:"linear-gradient(135deg,#3b82f6,#8b5cf6)",icon:"🎯"},
    {label:"Focus Sessions",value:sessionsCompleted,sub:"Pomodoro sessions done",grad:"linear-gradient(135deg,#f59e0b,#ef4444)",icon:"🍅"},
  ];

  return (
    <div className="fade-in-up">
      <div className="section-header">
        <h1 className="gradient-text">Productivity Dashboard</h1>
        <p>Track tasks, goals, focus sessions &amp; your overall momentum.</p>
      </div>

      {/* Stat Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
        {statCards.map((s,i)=>(
          <div key={i} className="stat-card" style={{background:s.grad,boxShadow:`0 8px 32px rgba(0,0,0,0.3)`}}>
            <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
            <p style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</p>
            <h2 style={{fontSize:36,fontWeight:800,color:"#fff",margin:"6px 0"}}>{s.value}</h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.65)"}}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:24}}>
        <div className="glass-card" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16,color:"#f1f5f9"}}>Task Completion</h2>
          <div style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={4} label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                  {pieData.map((e,i)=><Cell key={i} fill={COLORS.pie[i]}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16,color:"#f1f5f9"}}>Productivity Breakdown</h2>
          <div style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{fill:"#64748b",fontSize:12}}/>
                <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`} tick={{fill:"#64748b",fontSize:12}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" radius={[8,8,0,0]}>
                  {barData.map((_,i)=><Cell key={i} fill={COLORS.bar[i]}/>)}
                  <LabelList dataKey="value" position="top" formatter={v=>`${v}%`} style={{fill:"#94a3b8",fontSize:11}}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16,color:"#f1f5f9"}}>Weekly Activity</h2>
          <div style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="day" tick={{fill:"#64748b",fontSize:12}}/>
                <YAxis allowDecimals={false} tick={{fill:"#64748b",fontSize:12}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="tasks" fill="#10b981" radius={[6,6,0,0]} name="Tasks"/>
                <Bar dataKey="focus" fill="#8b5cf6" radius={[6,6,0,0]} name="Focus"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            <span style={{fontSize:12,color:"#64748b"}}>🟢 Tasks</span>
            <span style={{fontSize:12,color:"#64748b"}}>🟣 Focus</span>
          </div>
        </div>
      </div>

      {/* Heatmap + Insights */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        <div className="glass-card" style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700,color:"#f1f5f9"}}>Consistency Heatmap</h2>
            <span style={{fontSize:12,color:"#10b981",fontWeight:600}}>{heat.filter(d=>d.active).length}/28 days</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {heat.map(h=>(
              <div key={h.day} title={`Day ${h.day}`} className={`heatmap-cell ${h.active?"active":"inactive"}`}/>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            {["W1","W2","W3","W4"].map(w=><span key={w} style={{fontSize:10,color:"#475569"}}>{w}</span>)}
          </div>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:12}}>🔍 Focus Insight</h2>
          <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.7}}>
            You've completed <span style={{color:"#a78bfa",fontWeight:600}}>{sessionsCompleted}</span> Pomodoro sessions.
            {sessionsCompleted<5?" Start more sessions to build deep work momentum.":" Great momentum — keep it consistent!"}
          </p>
        </div>

        <div className="glass-card" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:12}}>⚡ Next Best Action</h2>
          <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.7}}>
            {pending>0
              ? `Complete one high-priority task and run a 25-min focus session to boost your score by ~10 points.`
              : "You're on fire! Add a new study goal or review completed topics to maintain momentum."}
          </p>
        </div>

        <div className="glass-card" style={{padding:24, background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(59,130,246,0.05))"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <h2 style={{fontSize:16,fontWeight:700,color:"#a78bfa"}}>🤖 AI Insight</h2>
            <span style={{fontSize:12,color:"#3b82f6",fontWeight:600}}>Score: {score}%</span>
          </div>
          <p style={{fontSize:14,color:"#e2e8f0",lineHeight:1.7, fontStyle:"italic"}}>
            "{aiInsight}"
          </p>
        </div>
      </div>
    </div>
  );
}
