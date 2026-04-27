import time

def fallback_reply(user_message):
    return f"""
📘 Topic Overview:
{user_message} ek important subject hai. Isko samajhne ke liye basic concepts clear hone chahiye.

🧩 Important Points:
- Basic definition
- Key concepts
- Practical usage

🛣 Study Plan:
1. Basics samjho
2. Examples dekho
3. Practice questions karo

📚 Resources:
- YouTube beginner videos
- Notes + PYQs

✅ Quick Tip:
Roz 1-2 hour dedicate karo aur revision karo.
"""

def get_study_reply(user_message: str) -> str:
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=user_message
            )
            return response.text.strip()

        except Exception as e:
            print("Retry:", attempt + 1, e)
            time.sleep(2)

    # 👉 FINAL fallback
    return fallback_reply(user_message)