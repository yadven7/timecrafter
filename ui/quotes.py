import tkinter as tk
from tkinter import ttk
import random

QUOTES = [
    "Push yourself, because no one else is going to do it for you.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Don’t watch the clock; do what it does. Keep going.",
    "Believe you can and you're halfway there.",
    "Dream big, work hard, and never give up.",
    "Every accomplishment starts with the decision to try.",
    "Don't be afraid to give up the good to go for the great.",
    "Success is not owned, it's leased. And rent is due every day.",
    "Your potential is endless.",
    "Difficult roads often lead to beautiful destinations.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Work hard in silence, let your success be the noise.",
    "Don't stop when you're tired. Stop when you're done.",
    "It always seems impossible until it's done.",
    "Every day is a new opportunity to grow and improve.",
    "Focus on your goals, not your fears.",
    "If you can dream it, you can achieve it.",
    "Small steps every day lead to big changes.",
    "Don't wait for opportunity. Create it.",
    "Start where you are. Use what you have. Do what you can.",
    "Dream big and dare to fail.",
    "Your only limit is your mind.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Don't count the days, make the days count.",
    "Believe in yourself and all that you are.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Change your thoughts and you change your world.",
    "Act as if what you do makes a difference. It does.",
    "Keep your face always toward the sunshine, and shadows will fall behind you.",
    "Success isn't always about greatness; it's about consistency.",
    "The secret of getting ahead is getting started.",
    "Don't limit your challenges. Challenge your limits.",
    "Only those who dare to fail greatly can ever achieve greatly.",
    "The best way to predict the future is to create it.",
    "What you do today can improve all your tomorrows.",
    "You don't have to be great to start, but you have to start to be great.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Your life does not get better by chance, it gets better by change.",
    "Every day is a new beginning. Take a deep breath, smile, and start again."
]

def populate(frame, font):
    quote_var = tk.StringVar()
    quote_var.set(random.choice(QUOTES))
    quote_label = ttk.Label(frame, textvariable=quote_var, font=font, wraplength=800)
    quote_label.pack(pady=10)

    def new_quote():
        quote_var.set(random.choice(QUOTES))

    ttk.Button(frame, text="New Quote", command=new_quote).pack()