import tkinter as tk
from tkinter import filedialog, Label
from PIL import Image, ImageTk
from transformers import pipeline

# Загружаем модель распознавания
classifier = pipeline("image-classification", model="microsoft/resnet-50")

def classify_image(image_path):
    image = Image.open(image_path).convert("RGB")
    results = classifier(image)
    top_results = "\n".join([f"{res['label']} ({res['score']:.2f})" for res in results[:5]])
    return top_results

def open_image():
    file_path = filedialog.askopenfilename()
    if file_path:
        # Показать изображение
        img = Image.open(file_path)
        img.thumbnail((300, 300))
        img_tk = ImageTk.PhotoImage(img)
        panel.config(image=img_tk)
        panel.image = img_tk

        # Распознать
        result = classify_image(file_path)
        result_label.config(text=result)

# GUI
root = tk.Tk()
root.title("Распознавание растения")
root.geometry("400x500")

btn = tk.Button(root, text="Выбрать изображение", command=open_image)
btn.pack(pady=10)

panel = Label(root)
panel.pack()

result_label = Label(root, text="", justify="left", wraplength=350)
result_label.pack(pady=10)

root.mainloop()
