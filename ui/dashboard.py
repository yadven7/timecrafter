import tkinter as tk
from tkinter import ttk
import random
from pathlib import Path
import json, datetime

QUOTES = [
    "Push yourself, because no one else is going to do it for you.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Don’t watch the clock; do what it does. Keep going."
]

def load_json(file):
    if Path(file).exists():
        with open(file) as f:
            return json.load(f)
    return []

def populate(frame, font):
    tasks = load_json("data/tasks.json")
    goals = load_json("data/goals.json")

    sorted_tasks = sorted(
        [t for t in tasks if not t["done"]],
        key=lambda t: ["None", "Low", "Medium", "High", "Urgent"].index(t["priority"])
    )

    sorted_goals = sorted(goals, key=lambda g: g.get("due", "9999-12-31"))

    def section(label, items):
        section = ttk.LabelFrame(frame, text=label)
        section.pack(fill="x", padx=10, pady=5)
        if items:
            for item in items[:3]:
                ttk.Label(section, text=f"- {item['text']}", font=font).pack(anchor="w", padx=10)
        else:
            ttk.Label(section, text="There is nothing to show. You have completed all your tasks.", font=font).pack(padx=10)

    section("Today's Tasks", sorted_tasks)
    section("Current Goals", sorted_goals)

    # Quote
    quote = random.choice(QUOTES)
    ttk.Label(frame, text=quote, wraplength=800, font=font).pack(pady=20)

