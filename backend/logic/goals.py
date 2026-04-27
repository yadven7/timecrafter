from storage import load_data, save_data, GOAL_FILE

def get_goals():
    return load_data(GOAL_FILE)

def add_goal(title, due_date="", progress=0):
    goals = load_data(GOAL_FILE)
    new_goal = {
        "id": len(goals) + 1,
        "title": title,
        "due_date": due_date,
        "progress": progress
    }
    goals.append(new_goal)
    save_data(GOAL_FILE, goals)
    return new_goal

def update_goal(goal_id, title, due_date, progress):
    goals = load_data(GOAL_FILE)
    for goal in goals:
        if goal["id"] == goal_id:
            goal["title"] = title
            goal["due_date"] = due_date
            goal["progress"] = progress
            save_data(GOAL_FILE, goals)
            return goal
    return {"error": "Goal not found"}

def delete_goal(goal_id):
    goals = load_data(GOAL_FILE)
    goals = [goal for goal in goals if goal["id"] != goal_id]
    save_data(GOAL_FILE, goals)
    return {"message": "Goal deleted"}