def set_theme(root, style, settings):
    if settings["theme"] == "dark":
        root.configure(bg="#2e2e2e")
        style.theme_use('clam')
        style.configure('.', background="#2e2e2e", foreground="white", fieldbackground="#3e3e3e")
    else:
        root.configure(bg="SystemButtonFace")
        style.theme_use('default')