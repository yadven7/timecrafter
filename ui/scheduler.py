import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, timedelta

URGENCY_SCORES = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Urgent": 4
}

def populate(frame, font):
    subjects = []
    start_var = tk.StringVar(value="15:00")
    end_var = tk.StringVar(value="21:00")
    subject_name = tk.StringVar()
    duration_var = tk.IntVar(value=60)
    urgency_var = tk.StringVar(value="Medium")

    ttk.Label(frame, text="Start Time (HH:MM)", font=font).pack()
    ttk.Entry(frame, textvariable=start_var).pack()

    ttk.Label(frame, text="End Time (HH:MM)", font=font).pack()
    ttk.Entry(frame, textvariable=end_var).pack()

    ttk.Label(frame, text="Subject Name", font=font).pack()
    ttk.Entry(frame, textvariable=subject_name).pack()

    ttk.Label(frame, text="Estimated Time (minutes)", font=font).pack()
    ttk.Entry(frame, textvariable=duration_var).pack()

    ttk.Label(frame, text="Urgency", font=font).pack()
    urgency_box = ttk.Combobox(frame, textvariable=urgency_var, values=["Low", "Medium", "High", "Urgent"], state="readonly")
    urgency_box.pack()

    subjects_box = tk.Listbox(frame, height=5, font=font)
    subjects_box.pack(fill="both", expand=True, padx=5, pady=5)

    def add_subject():
        name = subject_name.get().strip()
        duration = duration_var.get()
        urgency = urgency_var.get()

        if not name or duration <= 0:
            messagebox.showerror("Invalid Input", "Please enter a valid subject and duration.")
            return

        subjects.append({"name": name, "duration": duration, "urgency": urgency})
        subjects_box.insert(tk.END, f"{name} - {duration} min - {urgency}")
        subject_name.set("")
        duration_var.set(60)
        urgency_var.set("Medium")

    ttk.Button(frame, text="Add Subject", command=add_subject).pack(pady=5)

    output_box = tk.Text(frame, height=10, font=font)
    output_box.pack(fill="both", expand=True, padx=5, pady=5)

    def generate_schedule():
        try:
            start_time = datetime.strptime(start_var.get(), "%H:%M")
            end_time = datetime.strptime(end_var.get(), "%H:%M")
        except ValueError:
            messagebox.showerror("Invalid Time", "Please enter time in HH:MM format.")
            return

        available_minutes = int((end_time - start_time).total_seconds() // 60)
        if available_minutes <= 0:
            messagebox.showerror("Invalid Window", "End time must be after start time.")
            return

        sorted_subjects = sorted(subjects, key=lambda s: (-URGENCY_SCORES[s["urgency"]], s["duration"]))
        schedule = []
        current_time = start_time

        for sub in sorted_subjects:
            if sub["duration"] <= available_minutes:
                start_str = current_time.strftime("%H:%M")
                end_time_obj = current_time + timedelta(minutes=sub["duration"])
                end_str = end_time_obj.strftime("%H:%M")
                schedule.append(f"{start_str} - {end_str} : {sub['name']} ({sub['urgency']})")
                current_time = end_time_obj
                available_minutes -= sub["duration"]

        output_box.delete("1.0", tk.END)
        if schedule:
            output_box.insert(tk.END, "\\n".join(schedule))
        else:
            output_box.insert(tk.END, "No subjects could be scheduled in the available time.")

    ttk.Button(frame, text="Generate Smart Schedule", command=generate_schedule).pack(pady=10)