from storage import load_data, save_data, TASK_FILE

def get_tasks():
    return load_data(TASK_FILE)

def add_task(title, priority="None"):
    tasks = load_data(TASK_FILE)
    new_task = {
        "id": len(tasks) + 1,
        "title": title,
        "priority": priority,
        "done": False
    }
    tasks.append(new_task)
    save_data(TASK_FILE, tasks)
    return new_task

def complete_task(task_id):
    tasks = load_data(TASK_FILE)
    for t in tasks:
        if t["id"] == task_id:
            t["done"] = True
    save_data(TASK_FILE, tasks)
    return {"message": "completed"}

def delete_task(task_id):
    tasks = load_data(TASK_FILE)
    tasks = [t for t in tasks if t["id"] != task_id]
    save_data(TASK_FILE, tasks)
    return {"message": "deleted"}

def edit_task(task_id, title, priority):
    tasks = load_data(TASK_FILE)
    for t in tasks:
        if t["id"] == task_id:
            t["title"] = title
            t["priority"] = priority
            save_data(TASK_FILE, tasks)
            return t
    return {"error": "Task not found"}