import ollama
from supabase_client import supabase


def get_tasks():
    try:
        result = supabase.table("tasks").select("*").execute()
        return result.data
    except Exception as e:
        print("Tasks fetch error:", e)
        return []


def get_goals():
    try:
        result = supabase.table("goals").select("*").execute()
        return result.data
    except Exception as e:
        print("Goals fetch error:", e)
        return []


def get_scheduler_blocks():
    try:
        result = supabase.table("scheduler_blocks").select("*").execute()
        return result.data
    except Exception as e:
        print("Scheduler fetch error:", e)
        return []


def run_productivity_agent(message: str, user_id: str = "test-user"):
    tasks = get_tasks()
    goals = get_goals()
    schedule = get_scheduler_blocks()

    STYLE_RULES = """
Reply style:
- Use natural Hinglish, not pure Hindi.
- Use simple daily words like: task, schedule, study, focus, time, priority, plan.
- Avoid difficult Hindi words like: prajna, prabha, gyan, abhiyaan, sahayata, karya, samay prabandhan.
- Talk like a helpful friend/mentor.
- Keep tone casual but respectful.
- Use short sentences.
- Use clear bullet points.
- Do not over-explain.
- If user asks in English, reply in simple English.
- If user asks in Hinglish, reply in natural Hinglish.
- Never generate random philosophical or Sanskrit-style words.
"""

    prompt = f"""
You are TimeCrafter AI, a friendly productivity and study assistant.

Your job:
1. Help the user understand study topics clearly.
2. Help the user manage tasks, goals, and schedule.
3. Give practical suggestions like a helpful mentor.

User message:
{message}

User data:
Tasks: {tasks}
Goals: {goals}
Schedule: {schedule}

Response rules:
{STYLE_RULES}

Answer format:
- Start with a direct answer.
- Then give 2-4 useful points.
- End with one clear next step.

Important:
- Do not use difficult Hindi.
- Do not use random Hindi words.
- Do not talk out of context.
- Do not mention database or backend.
- Do not say "as an AI".
- Keep reply natural, like ChatGPT explaining to a student.

Now reply to the user properly.
"""

    response = ollama.chat(
        model="llama3.2:1b",
        messages=[{"role": "user", "content": prompt}],
        options={
            "temperature": 0.3,
            "top_p": 0.8,
            "repeat_penalty": 1.2,
        }
    )

    return response["message"]["content"].strip()