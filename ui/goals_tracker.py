import tkinter as tk
from tkinter import ttk

def populate(frame, font):
    ttk.Label(frame, text="Track Your Goals", font=font).pack(pady=5)
    goal_entry = ttk.Entry(frame, font=font)
    goal_entry.pack()

    goal_listbox = tk.Listbox(frame, font=font, height=10)
    goal_listbox.pack(fill="both", expand=True, pady=5)

    due_enabled = tk.BooleanVar()
    due_checkbox = ttk.Checkbutton(frame, text="Add due date?", variable=due_enabled)
    due_checkbox.pack()

    due_entry = ttk.Entry(frame, font=font)
    due_entry.pack()

    def add_goal():
        goal_text = goal_entry.get()
        if goal_text:
            goal = {"text": goal_text}
        if due_enabled.get():
            goal["due"] = due_entry.get()
    ttk.Button(frame, text="Add Goal", command=add_goal).pack(pady=5)