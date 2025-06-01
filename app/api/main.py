from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel
from pymongo import MongoClient
from auth import router as auth_router, get_current_user
from fastapi.routing import APIRoute
from datetime import date


# Модели
class Plant(BaseModel):
    name: str
    light: List[str]
    temperature: str
    humidity: str
    experience: str
    space: str
    path: str


class ScoredPlant(BaseModel):
    plant: Plant
    score: int
    explanation: List[str]


class PlantNameModel(BaseModel):
    plant_name: str


class CalendarEntry(BaseModel):
    date: date
    actions: List[str]


class AddCalendarRequest(BaseModel):
    plant_name: str
    entry: CalendarEntry


# FastAPI-приложение
app = FastAPI()
plantsrouter = APIRouter()

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(plantsrouter, prefix="/plants", tags=["plants"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017/")
db = client["plants"]
plants_collection = db["plants"]
user_data_collection = db["profiles"]
care_calendar_collection = db["care_calendar"]


def level_map(value: str, type_: str) -> int:
    levels = {
        "humidity": {"сухо": 1, "средне": 2, "влажно": 3},
        "experience": {"новичок": 1, "средний": 2, "опытный": 3},
        "temperature": {"холодная": 1, "умеренная": 2, "высокая": 3},
        "space": {"маленькое": 1, "среднее": 2, "большое": 3}
    }
    return levels.get(type_, {}).get(value, 0)


def rate_plant(plant: Dict[str, Any], criteria: Dict[str, str]) -> (int, List[str]):
    score = 0
    explanation = []

    if criteria["light"] in plant.get("light", []):
        score += 2
        explanation.append("Освещение соответствует")

    h_user = level_map(criteria["humidity"], "humidity")
    h_plant = level_map(plant["humidity"], "humidity")
    if h_user == h_plant:
        score += 2
        explanation.append("Влажность идеальна")
    elif abs(h_user - h_plant) == 1:
        score += 1
        explanation.append("Влажность допустима")

    t_user = level_map(criteria["temperature"], "temperature")
    t_plant = level_map(plant["temperature"], "temperature")
    if t_user == t_plant:
        score += 2
        explanation.append("Температура оптимальна")
    elif abs(t_user - t_plant) == 1:
        score += 1
        explanation.append("Температура допустима")

    e_user = level_map(criteria["experience"], "experience")
    e_plant = level_map(plant["experience"], "experience")
    if e_plant <= e_user:
        score += 2
        explanation.append("Подходит по уровню ухода")
    elif e_plant - e_user == 1:
        score += 1
        explanation.append("Требует немного больше опыта")
    else:
        explanation.append("Требует значительно больше опыта")

    s_user = level_map(criteria["space"], "space")
    s_plant = level_map(plant["space"], "space")
    if s_plant <= s_user:
        score += 2
        explanation.append("Подходит по пространству")
    elif s_plant - s_user == 1:
        score += 1
        explanation.append("Немного больше пространства, чем указано")
    else:
        explanation.append("Может не подойти по пространству")

    return score, explanation


@app.post("/recommend_plants/", response_model=List[ScoredPlant])
async def recommend_plants(criteria: Dict[str, str]):
    plants = list(plants_collection.find({}, {"_id": 0}))
    perfect = []
    possible = []

    for plant in plants:
        score, explanation = rate_plant(plant, criteria)
        result = {
            "plant": plant,
            "score": score,
            "explanation": explanation
        }

        if score >= 9:
            perfect.append(result)
        elif score >= 6:
            possible.append(result)

    perfect.sort(key=lambda x: x["score"], reverse=True)
    possible.sort(key=lambda x: x["score"], reverse=True)

    return perfect[:2] + possible[:3]


@app.get("/all")
def get_all_plants():
    plants = list(plants_collection.find({}, {"_id": 0}))
    return plants


@app.post("/profile/add_plant")
def add_plant_to_profile(plant_name: str = Body(...), current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")

    result = user_data_collection.update_one(
        {"username": current_user["username"]},
        {"$addToSet": {"colors": plant_name}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Не удалось добавить растение")
    filter_query = {"user": current_user["username"], "plant_name": plant_name}
    existing = care_calendar_collection.find_one(filter_query)
    if not existing:
        care_calendar_collection.insert_one({
            "user": current_user["username"],
            "plant_name": plant_name,
            "entries": []
        })

    return {"message": "Растение успешно добавлено и календарь создан"}


@app.delete("/profile/remove_plant")
def remove_plant_from_profile(plant_name: str = Body(...), current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")

    result = user_data_collection.update_one(
        {"username": current_user["username"]},
        {"$pull": {"colors": plant_name}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Растение не найдено в профиле")

    return {"message": "Растение удалено из профиля"}


@app.get("/profile/favorites", response_model=List[Plant])
def get_favorites(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")

    user_profile = user_data_collection.find_one({"username": current_user["username"]},
                                                 {"favoritescolors": 1, "_id": 0})
    if not user_profile or "favoritescolors" not in user_profile:
        return []

    favorite_names = user_profile["favoritescolors"]
    plants = list(plants_collection.find({"name": {"$in": favorite_names}}, {"_id": 0}))
    return plants


@app.post("/profile/favorites/add")
def add_favorite(data: PlantNameModel, current_user: dict = Depends(get_current_user)):
    plant_name = data.plant_name
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")

    plant = plants_collection.find_one({"name": plant_name})
    if not plant:
        raise HTTPException(status_code=404, detail="Растение не найдено")

    result = user_data_collection.update_one(
        {"username": current_user["username"]},
        {"$addToSet": {"favoritescolors": plant_name}}
    )

    if result.modified_count == 0:
        return {"message": "Растение уже в избранном"}

    return {"message": "Растение добавлено в избранное"}


@app.delete("/profile/favorites/remove")
def remove_favorite(data: PlantNameModel, current_user: dict = Depends(get_current_user)):
    plant_name = data.plant_name
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")

    result = user_data_collection.update_one(
        {"username": current_user["username"]},
        {"$pull": {"favoritescolors": plant_name}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Растение не найдено в избранном")

    return {"message": "Растение удалено из избранного"}


# === КАЛЕНДАРЬ ===

@app.get("/calendar/{plant_name}", response_model=List[CalendarEntry])
def get_calendar(plant_name: str, current_user: dict = Depends(get_current_user)):
    record = care_calendar_collection.find_one({
        "user": current_user["username"],
        "plant_name": plant_name
    })

    if not record:
        return []

    return record["entries"]


@app.post("/calendar/add")
def add_calendar_entry(
    data: AddCalendarRequest,
    current_user: dict = Depends(get_current_user)
):
    filter_query = {
        "user": current_user["username"],
        "plant_name": data.plant_name
    }

    existing = care_calendar_collection.find_one(filter_query)

    entry_dict = data.entry.dict()
    entry_dict['date'] = entry_dict['date'].isoformat()

    if not existing:
        care_calendar_collection.insert_one({
            "user": current_user["username"],
            "plant_name": data.plant_name,
            "entries": [entry_dict]
        })
    else:
        updated_entries = [e for e in existing["entries"] if e["date"] != entry_dict['date']]
        updated_entries.append(entry_dict)
        care_calendar_collection.update_one(
            filter_query,
            {"$set": {"entries": updated_entries}}
        )

    return {"message": "Запись добавлена/обновлена"}



@app.delete("/calendar/delete")
def delete_calendar_entry(
        plant_name: str = Body(...),
        date_str: str = Body(...),
        current_user: dict = Depends(get_current_user)
):
    filter_query = {
        "user": current_user["username"],
        "plant_name": plant_name
    }

    care_calendar_collection.update_one(
        filter_query,
        {"$pull": {"entries": {"date": date_str}}}
    )

    return {"message": "Запись удалена"}


@app.get("/care/{plant_name}")
def get_care_recommendation(plant_name: str):
    plant = plants_collection.find_one({"name": plant_name})
    if not plant:
        raise HTTPException(status_code=404, detail="Растение не найдено")

    care = plant.get("care_recommendation")
    if not care:
        raise HTTPException(status_code=404, detail="Совет по уходу отсутствует")

    return {"plant": plant_name, "care_recommendation": care}







