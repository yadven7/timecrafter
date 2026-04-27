def generate_schedule(start_time, end_time, subjects):
    # time convert to minutes
    def to_minutes(t):
        h, m = map(int, t.split(":"))
        return h * 60 + m

    def to_time(m):
        return f"{m//60:02d}:{m%60:02d}"

    start = to_minutes(start_time)
    end = to_minutes(end_time)

    # sort by urgency + duration
    priority_map = {"High": 1, "Medium": 2, "Low": 3}
    subjects.sort(key=lambda x: (priority_map[x["urgency"]], x["duration"]))

    schedule = []
    current = start

    for sub in subjects:
        if current + sub["duration"] > end:
            break

        schedule.append({
            "task": sub["name"],
            "start": to_time(current),
            "end": to_time(current + sub["duration"])
        })

        current += sub["duration"]

    return schedule