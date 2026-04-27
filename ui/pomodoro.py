import tkinter as tk
from tkinter import ttk, messagebox
import time
import threading

def populate(frame, font):
    timer_var = tk.StringVar()
    timer_var.set("--:--")
    ttk.Label(frame, textvariable=timer_var, font=("Courier", 32)).pack(pady=10)

    focus_var = tk.IntVar(value=25)
    break_var = tk.IntVar(value=5)

    ttk.Label(frame, text="Focus (min):").pack()
    ttk.Entry(frame, textvariable=focus_var).pack()
    ttk.Label(frame, text="Break (min):").pack()
    ttk.Entry(frame, textvariable=break_var).pack()

    # Control flags
    stop_flag = threading.Event()
    pause_flag = threading.Event()

    state = {
        "is_running": False,
        "is_paused": False
    }

    start_btn = ttk.Button(frame, text="Start Pomodoro")
    start_btn.pack(pady=5)

    def run_session(minutes, label):
        total_seconds = minutes * 60
        for t in range(total_seconds, -1, -1):
            if stop_flag.is_set():
                return False
            while pause_flag.is_set():  # Pause behavior
                time.sleep(0.1)
            mins, secs = divmod(t, 60)
            try:
                timer_var.set(f"{mins:02}:{secs:02}")
                time.sleep(1)
            except tk.TclError:
                return False
        return True

    def start_cycle():
        while not stop_flag.is_set():
            # Focus session
            if not run_session(focus_var.get(), "Focus"):
                break
            try:
                messagebox.showinfo("Pomodoro", "Time's up! Take a break!")
            except tk.TclError:
                break

            # Break session
            if not run_session(break_var.get(), "Break"):
                break
            try:
                messagebox.showinfo("Pomodoro", "Break's over! Back to work!")
            except tk.TclError:
                break

    def toggle_timer():
        if not state["is_running"]:
            # Start timer
            stop_flag.clear()
            pause_flag.clear()
            state["is_running"] = True
            state["is_paused"] = False
            start_btn.config(text="Pause")
            threading.Thread(target=start_cycle, daemon=True).start()

        elif not state["is_paused"]:
            # Pause timer
            pause_flag.set()
            state["is_paused"] = True
            start_btn.config(text="Resume")
        else:
            # Resume timer
            pause_flag.clear()
            state["is_paused"] = False
            start_btn.config(text="Pause")

    start_btn.config(command=toggle_timer)

    def stop_timer():
        stop_flag.set()
        pause_flag.clear()
        state["is_running"] = False
        state["is_paused"] = False
        start_btn.config(text="Start Pomodoro")

    ttk.Button(frame, text="Stop", command=stop_timer).pack(pady=5)
