import tkinter as tk
from tkinter import ttk
import json, os
from pathlib import Path

DATA_FILE = Path("data/tasks.json")

def populate(frame, font):
    tasks = load_tasks()

    # UI
    entry = ttk.Entry(frame, font=font)
    entry.pack()
    priority_var = tk.StringVar(value="None")
    priority_menu = ttk.Combobox(frame, textvariable=priority_var, values=["None", "Low", "Medium", "High", "Urgent"], state="readonly")
    priority_menu.pack()

    listbox = tk.Listbox(frame, font=font, height=10)
    listbox.pack(fill="both", expand=True, pady=5)

    def refresh_list():
        listbox.delete(0, tk.END)
        for task in tasks:
            text = f"[{task['priority']}] {'✔ ' if task['done'] else ''}{task['text']}"
            listbox.insert(tk.END, text)

    def add():
        task_text = entry.get()
        if task_text:
            tasks.append({"text": task_text, "priority": priority_var.get(), "done": False})
            save_tasks(tasks)
            entry.delete(0, tk.END)
            refresh_list()

    def delete():
        sel = listbox.curselection()
        if sel:
            tasks.pop(sel[0])
            save_tasks(tasks)
            refresh_list()

    def mark_complete():
        sel = listbox.curselection()
        if sel:
            tasks[sel[0]]["done"] = True
            save_tasks(tasks)
            refresh_list()

    ttk.Button(frame, text="Add", command=add).pack()
    ttk.Button(frame, text="Complete", command=mark_complete).pack()
    ttk.Button(frame, text="Delete", command=delete).pack()

    refresh_list()

def load_tasks():
    if DATA_FILE.exists():
        with open(DATA_FILE) as f:
            return json.load(f)
    return []

def save_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=2)
