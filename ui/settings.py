import tkinter as tk
from tkinter import simpledialog, ttk
from utils import theme, settings_data
from tkinter import font as tkfont

def create_menu(root, app):
    menubar = tk.Menu(root)
    settings_menu = tk.Menu(menubar, tearoff=0)
    settings_menu.add_command(label="Font Size", command=lambda: change_font_size(app))
    settings_menu.add_command(label="Font Family", command=lambda: change_font_family(app))
    settings_menu.add_command(label="Toggle Dark Mode", command=lambda: toggle_theme(root, app))
    settings_menu.add_command(label="Set Window Size", command=lambda: change_window_size(root, app))
    menubar.add_cascade(label="Settings", menu=settings_menu)
    root.config(menu=menubar)

def change_font_size(app):
    size = simpledialog.askinteger("Font Size", "Enter font size:", initialvalue=app.settings["font_size"])
    if size:
        app.settings["font_size"] = size
        app.font.configure(size=size)

def change_font_family(app):
    top = tk.Toplevel()
    top.title("Select Font Family")
    font_var = tk.StringVar(value=app.settings["font_family"])
    fonts = sorted(tkfont.families())
    dropdown = ttk.Combobox(top, textvariable=font_var, values=fonts, state="readonly")
    dropdown.pack(padx=20, pady=10)

    def apply():
        selected = font_var.get()
        if selected:
            app.settings["font_family"] = selected
            app.font.configure(family=selected)
        top.destroy()

    ttk.Button(top, text="Apply", command=apply).pack(pady=10)


def toggle_theme(root, app):
    app.settings["theme"] = "dark" if app.settings["theme"] == "light" else "light"
    theme.set_theme(root, app.style, app.settings)

RESOLUTIONS = ["800x600", "1024x720", "1280x800", "1366x768", "1920x1080"]

def change_window_size(root, app):
    top = tk.Toplevel()
    top.title("Select Resolution")
    size_var = tk.StringVar(value=app.settings["window_size"])
    dropdown = ttk.Combobox(top, textvariable=size_var, values=RESOLUTIONS, state="readonly")
    dropdown.pack(padx=20, pady=10)

    def apply():
        selected = size_var.get()
        if selected:
            app.settings["window_size"] = selected
            root.geometry(selected)
        top.destroy()

    ttk.Button(top, text="Apply", command=apply).pack(pady=10)
