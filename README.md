# 📚 Smart Study Planner

**Smart Study Planner** is a desktop application built with **Python and Tkinter** that helps students efficiently plan, prioritize, and track their study goals using a clean interface and intelligent scheduling logic.

---

## 🧠 Features

### ✅ Task Manager
- Add, complete, and delete tasks
- Strike-through completed items
- Optional task priority: `None`, `Low`, `Medium`, `High`, `Urgent`
- Tasks saved locally in `tasks.json`

### ✅ Study Goals Tracker
- Add long-term study goals
- Optional due date per goal
- View & track progress
- Saved in `goals.json`

### ✅ Smart Schedule Generator (AI Logic)
- Enter available study time (e.g., 3 PM – 9 PM)
- List subjects with estimated duration & urgency
- Automatically generates an optimized schedule using heuristics
- Prioritizes urgent and short tasks
- Clear, time-based output format

### ✅ Pomodoro Timer
- Customize focus and break durations
- Start/Pause/Resume/Stop timer
- Looping cycles with pop-up reminders
- Prevents multiple concurrent sessions

### ✅ Motivational Quotes
- Refreshable library of uplifting quotes
- Displayed on-demand and on the dashboard

### ✅ Dashboard
- At-a-glance view of:
  - Pending tasks (sorted by priority)
  - Active goals
  - Today’s smart schedule
  - Motivational quote of the day

### ✅ Settings
- Switch between Light and Dark modes
- Change font family and size
- Set fixed window size (non-resizable for consistency)

---

## 🗂 Folder Structure

study_planner_app/
├── main.py
├── ui/
│ ├── dashboard.py
│ ├── task_manager.py
│ ├── goals_tracker.py
│ ├── scheduler.py
│ ├── quotes.py
│ ├── pomodoro.py
│ └── settings.py
├── utils/
│ ├── theme.py
│ └── settings_data.py
├── data/
│ ├── tasks.json
│ └── goals.json
---

## 🚀 Getting Started

### Requirements
- Python 3.8 or later
- `tkinter` (comes pre-installed with Python)

### Run the App

```bash
python main.py
