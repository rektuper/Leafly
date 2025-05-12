import json
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["plants"]
collection = db["plants"]

def get_user_criteria():
    def ask(prompt, options):
        while True:
            print(f"{prompt} ({'/'.join(options)}):")
            value = input().strip().lower()
            if value in options:
                return value
            print("Ошибка: попробуйте снова.")

    criteria = {
        "light": ask("Тип освещения", ["яркое", "рассеянный", "полутень", "тень"]),
        "temperature": ask("Температура", ["высокая", "умеренная", "холодная"]),
        "humidity": ask("Влажность", ["сухо", "средне", "влажно"]),
        "experience": ask("Опыт ухода", ["новичок", "средний", "опытный"]),
        "space": ask("Размер пространства", ["маленькое", "среднее", "большое"]),
    }

    return criteria

def recommend_plants(criteria):
    query = {
        "light": {"$in": [criteria["light"]]},
        "temperature": criteria["temperature"],
        "humidity": criteria["humidity"],
        "experience": criteria["experience"],
        "space": criteria["space"]
    }
    results = list(collection.find(query, {"_id": 0}))
    return results

def explain_result(plant, criteria):
    explanation = f"✅ {plant['name']} подходит вам, потому что:"
    for key in criteria:
        explanation += f"\n - {key.capitalize()}: {plant.get(key, 'нет данных')} (вы выбрали: {criteria[key]})"
    return explanation

def run_expert_system():
    print("🌿 Добро пожаловать в экспертную систему подбора растений!")
    while True:
        criteria = get_user_criteria()
        results = recommend_plants(criteria)

        if results:
            print(f"\n🔎 Найдено {len(results)} подходящих растений:\n")
            for plant in results:
                print(f"- {plant['name']} ({plant['path']})")
                print(explain_result(plant, criteria))
                print()
        else:
            print("😢 К сожалению, по введённым критериям подходящих растений не найдено.")

        cont = input("\nХотите попробовать снова? (да/нет): ").strip().lower()
        if cont != 'да':
            break

if __name__ == "__main__":
    run_expert_system()
