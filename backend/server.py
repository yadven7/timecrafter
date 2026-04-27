import json
import os
import urllib.request
import urllib.error
import random
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TASK_FILE = os.path.join(BASE_DIR, "tasks.json")
GOAL_FILE = os.path.join(BASE_DIR, "goals.json")

QUOTES = [
    "Small progress is still progress.",
    "Consistency beats intensity.",
    "Study now, shine later.",
    "Discipline is the bridge between goals and success.",
    "One focused hour can change your whole day.",
    "Don’t watch the clock; use it.",
    "Your future self is watching your effort today.",
    "Success is built one study session at a time.",
    "Focus on progress, not perfection.",
    "A little every day adds up to a lot."
]

def load_data(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_study_reply(user_message):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return "Chatbot setup incomplete. GEMINI_API_KEY environment variable is missing."

    system_prompt = """
You are StudyMate, a smart study assistant inside TimeCrafter.

Your job is to help students study better, not just fill a fixed format.

Reply style rules:
- Understand the user's intent first.
- If the user asks to explain, explain clearly with examples.
- If the user asks for a plan, give a time-based study plan.
- If the user asks for resources, suggest resource types and search keywords.
- If the user asks for viva/interview, give questions with short answers.
- If the user asks for revision, give quick notes and key points.
- If the user asks casually, reply naturally.
- Use simple student-friendly language.
- Keep answers practical.
- Do not force the same format every time.
- Avoid very long answers unless user asks in detail.
- Use headings only when useful.
- Use bullet points for readability.
- Hindi/English mixed reply is allowed if user writes in Hinglish.

Important:
Never give random vague motivation only. Always give useful next steps.
"""

    prompt = f"""
{system_prompt}

User asked:
{user_message}

Now give the most useful answer for this exact request.
"""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-1.5-flash:generateContent?key="
        + api_key
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 700
        }
    }

    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            result = json.loads(response.read().decode("utf-8"))

        text = result["candidates"][0]["content"]["parts"][0]["text"]

        text = text.replace("**", "")
        text = text.replace("##", "")
        text = text.replace("###", "")

        return text.strip()

    except urllib.error.HTTPError as e:
        error_text = e.read().decode("utf-8")
        return "Chatbot API error:\n" + error_text

    except Exception as e:
        print("DEBUG ERROR:", e)
        return "Chatbot error:\n" + str(e)

class Handler(BaseHTTPRequestHandler):
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_json({})

    def get_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/tasks":
            self.send_json(load_data(TASK_FILE))
        elif path == "/goals":
            self.send_json(load_data(GOAL_FILE))
        elif path == "/quote/random":
            self.send_json({"quote": random.choice(QUOTES)})
        else:
            self.send_json({"message": "Backend running"})

    def do_POST(self):
        path = urlparse(self.path).path
        body = self.get_body()

        if path == "/tasks":
            tasks = load_data(TASK_FILE)
            new_task = {
                "id": max([t.get("id", 0) for t in tasks], default=0) + 1,
                "title": body.get("title", ""),
                "priority": body.get("priority", "Medium"),
                "done": False
            }
            tasks.append(new_task)
            save_data(TASK_FILE, tasks)
            self.send_json(new_task)

        elif path == "/goals":
            goals = load_data(GOAL_FILE)
            new_goal = {
                "id": max([g.get("id", 0) for g in goals], default=0) + 1,
                "title": body.get("title", ""),
                "due_date": body.get("due_date", ""),
                "progress": int(body.get("progress", 0))
            }
            goals.append(new_goal)
            save_data(GOAL_FILE, goals)
            self.send_json(new_goal)

        elif path == "/chatbot":
            message = body.get("message", "")
            reply = get_study_reply(message)
            self.send_json({"reply": reply})

    def do_PUT(self):
        path = urlparse(self.path).path

        if path.startswith("/tasks/"):
            task_id = int(path.split("/")[-1])
            tasks = load_data(TASK_FILE)

            for task in tasks:
                if task["id"] == task_id:
                    task["done"] = True
                    save_data(TASK_FILE, tasks)
                    self.send_json(task)
                    return

            self.send_json({"error": "Task not found"}, 404)

    def do_PATCH(self):
        path = urlparse(self.path).path
        body = self.get_body()

        if path.startswith("/tasks/"):
            task_id = int(path.split("/")[-1])
            tasks = load_data(TASK_FILE)

            for task in tasks:
                if task["id"] == task_id:
                    task["title"] = body.get("title", task["title"])
                    task["priority"] = body.get("priority", task["priority"])
                    save_data(TASK_FILE, tasks)
                    self.send_json(task)
                    return

            self.send_json({"error": "Task not found"}, 404)

    def do_DELETE(self):
        path = urlparse(self.path).path

        if path.startswith("/tasks/"):
            task_id = int(path.split("/")[-1])
            tasks = load_data(TASK_FILE)
            tasks = [t for t in tasks if t["id"] != task_id]
            save_data(TASK_FILE, tasks)
            self.send_json({"message": "Task deleted"})

        elif path.startswith("/goals/"):
            goal_id = int(path.split("/")[-1])
            goals = load_data(GOAL_FILE)
            goals = [g for g in goals if g["id"] != goal_id]
            save_data(GOAL_FILE, goals)
            self.send_json({"message": "Goal deleted"})

if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 8000), Handler)
    print("Backend running on http://127.0.0.1:8000")
    server.serve_forever()