import tkinter as tk
from tkinter import ttk
from tkinter.font import Font, families
from ui import task_manager, scheduler, goals_tracker, quotes, pomodoro, settings, dashboard
from utils import theme, settings_data

class StudyPlannerApp:
    def __init__(self, root):
        self.root = root
        self.settings = settings_data.load_settings()
        self.font = Font(family=self.settings["font_family"], size=self.settings["font_size"])
        self.root.title("Study Planner")
        self.root.geometry(self.settings["window_size"])
        self.style = ttk.Style()
        self.root.resizable(False, False)
        theme.set_theme(self.root, self.style, self.settings)

        settings.create_menu(self.root, self)

        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True)

        dashboard_frame = self.create_scrollable_tab("Dashboard")
        dashboard.populate(dashboard_frame, self.font)
        task_frame = self.create_scrollable_tab("Tasks")
        scheduler_frame = self.create_scrollable_tab("Smart Scheduler")
        goals_frame = self.create_scrollable_tab("Goals")
        quotes_frame = self.create_scrollable_tab("Motivational Quotes")
        pomodoro_frame = self.create_scrollable_tab("Pomodoro Timer")

        task_manager.populate(task_frame, self.font)
        scheduler.populate(scheduler_frame, self.font)
        goals_tracker.populate(goals_frame, self.font)
        quotes.populate(quotes_frame, self.font)
        pomodoro.populate(pomodoro_frame, self.font)

    def create_scrollable_tab(self, name):
        frame = ttk.Frame(self.notebook)
        self.notebook.add(frame, text=name)
        canvas = tk.Canvas(frame)
        scrollbar = ttk.Scrollbar(frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)

        scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        return scrollable_frame
    
if __name__ == "__main__":
    root = tk.Tk()
    app = StudyPlannerApp(root)
    root.mainloop()