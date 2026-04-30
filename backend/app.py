from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Task
from logic.tasks import *
from models import Task, Goal
from logic.goals import get_goals, add_goal, update_goal, delete_goal
from models import Task, Goal, ChatRequest
from chatbot import get_study_reply
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import FastAPI
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI()

genai.configure(api_key="YOUR_GEMINI_API_KEY")

class Query(BaseModel):
    question: str

# Default fallback
def fallback_answer(q):
    return f"Sorry, AI abhi busy hai 😅\n\nBut aap '{q}' YouTube ya Google pe search karo — ye topic important hai!"

@app.post("/chat")
async def chat(query: Query):
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(query.question)

        if response and response.text:
            return {"reply": response.text}

    except Exception as e:
        print("Gemini Error:", e)

    # fallback
    return {"reply": fallback_answer(query.question)}


@app.get("/tasks")
def read_tasks():
    return get_tasks()

@app.post("/tasks")
def create_task(task: Task):
    return add_task(task.title, task.priority)

@app.put("/tasks/{task_id}")
def complete(task_id: int):
    return complete_task(task_id)

@app.delete("/tasks/{task_id}")
def delete(task_id: int):
    return delete_task(task_id)

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    return edit_task(task_id, task.title, task.priority)

@app.get("/goals")
def read_goals():
    return get_goals()

@app.post("/goals")
def create_goal(goal: Goal):
    return add_goal(goal.title, goal.due_date, goal.progress)

@app.patch("/goals/{goal_id}")
def edit_goal(goal_id: int, goal: Goal):
    return update_goal(goal_id, goal.title, goal.due_date, goal.progress)

@app.delete("/goals/{goal_id}")
def remove_goal(goal_id: int):
    return delete_goal(goal_id)

@app.post("/chatbot")
def study_chat(request: ChatRequest):
    reply = get_study_reply(request.message)
    return {"reply": reply}

@app.get("/")
def home():
    return {"message": "TimeCrafter backend is running"}

@app.get("/quote/random")
def random_quote():
    return {
        "quote": "Small progress every day leads to big results.",
        "author": "TimeCrafter"
    }