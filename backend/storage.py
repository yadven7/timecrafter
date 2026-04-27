import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TASK_FILE = os.path.join(BASE_DIR, "tasks.json")
GOAL_FILE = os.path.join(BASE_DIR, "goals.json")

def load_data(file):
    if not os.path.exists(file):
        return []
    with open(file, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(file, data):
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)