from pydantic import BaseModel

class Task(BaseModel):
    title: str
    priority: str = "None"

class Goal(BaseModel):
    title: str
    due_date: str = ""
    progress: int = 0

class ChatRequest(BaseModel):
    message: str