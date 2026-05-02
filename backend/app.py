from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from fastapi import Header, HTTPException
from supabase_client import supabase
from models import Task, Goal, ChatRequest
from logic.tasks import get_tasks, add_task, complete_task, delete_task, edit_task
from logic.goals import get_goals, add_goal, update_goal, delete_goal
from chatbot import get_study_reply
from logic.scheduler import ScheduleBlock, get_blocks, add_block, delete_block


class TaskCreate(BaseModel):
    title: str
    priority: str = "Medium"
    completed: bool = False


class GoalCreate(BaseModel):
    title: str
    due_date: str | None = None
    progress: int = 0


class SchedulerBlockCreate(BaseModel):
    title: str
    category: str = "Focus"
    start_hour: int
    duration: float = 1
    day: str
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174", # In case Vite uses another port
        "*" # (Optional) Just for local development to bypass it entirely
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "TimeCrafter Backend Running"}


# ---------------- QUOTES ----------------

@app.get("/quote/random")
def random_quote():
    return {
        "quote": "Small progress every day leads to big results.",
        "author": "TimeCrafter"
    }

# ---------------- TASKS SUPABASE ----------------

@app.get("/tasks")
def read_tasks(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = (
        supabase.table("tasks")
        .select("*")
        .eq("user_id", user_id)
        .order("id", desc=True)
        .execute()
    )
    return result.data


@app.post("/tasks")
def create_task(task: TaskCreate, authorization: str = Header(None)):
    try:
        user_id = get_user_id(authorization)
        result = supabase.table("tasks").insert({
            "user_id": user_id,
            "title": task.title,
            "priority": task.priority,
            "completed": task.completed,
        }).execute()
        return result.data[0]
    except Exception as e:
        print(f"Supabase Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


class TaskUpdate(BaseModel):
    title: str | None = None
    priority: str | None = None
    completed: bool | None = None

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    
    update_data = {}
    if task.title is not None:
        update_data["title"] = task.title
    if task.priority is not None:
        update_data["priority"] = task.priority
    if task.completed is not None:
        update_data["completed"] = task.completed

    result = (
        supabase.table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0]

@app.delete("/tasks/{task_id}")
def delete_task_route(task_id: int, authorization: str = Header(None)):
    user_id = get_user_id(authorization)

    res = (
        supabase.table("tasks")
        .delete()
        .eq("id", task_id)
        .eq("user_id", user_id)   # IMPORTANT
        .execute()
    )

    # debug (optional)
    print("DELETE RES:", res)

    return {"message": "Task deleted"}

# ---------------- GOALS SUPABASE ----------------

@app.get("/goals")
def read_goals(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = (
        supabase.table("goals")
        .select("*")
        .eq("user_id", user_id)
        .order("id", desc=True)
        .execute()
    )
    return result.data


@app.post("/goals")
def create_goal(goal: GoalCreate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("goals").insert({
        "user_id": user_id,
        "title": goal.title,
        "due_date": goal.due_date,
        "progress": goal.progress,
    }).execute()
    return result.data[0]


@app.patch("/goals/{goal_id}")
def edit_goal(goal_id: int, goal: GoalCreate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = (
        supabase.table("goals")
        .update({
            "title": goal.title,
            "due_date": goal.due_date,
            "progress": goal.progress,
        })
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0]


@app.delete("/goals/{goal_id}")
def remove_goal(goal_id: int, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    supabase.table("goals").delete().eq("id", goal_id).eq("user_id", user_id).execute()
    return {"message": "Goal deleted"}


# ---------------- SMART SCHEDULER SUPABASE ----------------

@app.get("/scheduler/blocks")
def fetch_schedule_blocks(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = (
        supabase.table("scheduler_blocks")
        .select("*")
        .eq("user_id", user_id)
        .order("start_hour")
        .execute()
    )
    return result.data


@app.post("/scheduler/blocks")
def create_schedule_block(block: SchedulerBlockCreate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("scheduler_blocks").insert({
        "user_id": user_id,
        "title": block.title,
        "category": block.category,
        "start_hour": block.start_hour,
        "duration": block.duration,
        "day": block.day,
    }).execute()
    return result.data[0]


@app.delete("/scheduler/blocks/{block_id}")
def remove_schedule_block(block_id: int, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    supabase.table("scheduler_blocks").delete().eq("id", block_id).eq("user_id", user_id).execute()
    return {"message": "Block deleted"}


# ---------------- POMODORO SUPABASE ----------------

class PomodoroUpdate(BaseModel):
    focus_minutes: int | None = None
    break_minutes: int | None = None
    sessions_completed: int | None = None

@app.get("/pomodoro_sessions")
def get_pomodoro(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("pomodoro_settings").select("*").eq("user_id", user_id).execute()
    if result.data:
        return result.data[0]
    else:
        new_setting = {"user_id": user_id, "focus_minutes": 25, "break_minutes": 5, "sessions_completed": 0}
        res = supabase.table("pomodoro_settings").insert(new_setting).execute()
        if res.data:
            return res.data[0]
        return new_setting

@app.post("/pomodoro_sessions")
def update_pomodoro(pomo: PomodoroUpdate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    update_data = {}
    if pomo.focus_minutes is not None: update_data["focus_minutes"] = pomo.focus_minutes
    if pomo.break_minutes is not None: update_data["break_minutes"] = pomo.break_minutes
    if pomo.sessions_completed is not None: update_data["sessions_completed"] = pomo.sessions_completed
    
    if update_data:
        res = supabase.table("pomodoro_settings").update(update_data).eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]
    return {"message": "no update"}

# ---------------- GEMINI CHAT ----------------

genai.configure(api_key="YOUR_GEMINI_API_KEY")


class Query(BaseModel):
    question: str


def fallback_answer(q):
    return f"Sorry, AI abhi busy hai 😅\n\nBut aap '{q}' YouTube ya Google pe search karo — ye topic important hai!"


def get_user_id(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")

    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/chat")
async def chat(query: Query):
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(query.question)

        if response and response.text:
            return {"reply": response.text}

    except Exception as e:
        print("Gemini Error:", e)

    return {"reply": fallback_answer(query.question)}

from ai_agent import run_productivity_agent

class AgentRequest(BaseModel):
    message: str

@app.post("/ai/agent")
def ai_agent(request: AgentRequest):
    reply = run_productivity_agent(request.message, "test-user")
    return {"reply": reply}

@app.post("/ai/agent-test")
def ai_agent_test(request: AgentRequest):
    reply = run_productivity_agent(request.message, "test-user")
    return {"reply": reply}