from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional


SECRET_KEY = "23249930434aca721b389f9865779e5fb231eab484fb35613d7536f1edc7e041"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

router = APIRouter()
client = MongoClient("mongodb://localhost:27017/")
db = client["plants"]
users_collection = db["users"]
user_data_collection = db["profiles"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_user(username: str):
    return users_collection.find_one({"username": username})


def authenticate_user(login: str, password: str):
    user = users_collection.find_one({"$or": [{"username": login}, {"email": login}]})
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return get_user(username)
    except JWTError:
        raise credentials_exception


@router.post("/register")
def register(user: UserCreate):
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")

    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Пользователь с такой почтой уже существует")

    hashed_password = get_password_hash(user.password)
    result = users_collection.insert_one({
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password
    })

    user_id = result.inserted_id

    user_data_collection.insert_one({
        "user_id": str(user_id),
        "username": user.username,
        "email": user.email,
        "name": "",
        "surname": "",
        "lastname": "",
        "city": "",
        "colors": [],
        "notes": ""
    })

    return {"msg": "Пользователь зарегистрирован"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверные имя пользователя или пароль")
    access_token = create_access_token(data={"sub": user["username"]},
                                       expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"]}


@router.get("/profile/me")
def read_user_profile(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")
    profile = user_data_collection.find_one({"username": current_user["username"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Профиль пользователя не найден")
    profile["_id"] = str(profile["_id"])
    profile.pop("user_id", None)
    return profile


@router.put("/profile/me")
def update_user_profile(
    updated_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Неавторизованный доступ")

    updated_data.pop("_id", None)

    result = user_data_collection.find_one_and_update(
        {"username": current_user["username"]},
        {"$set": updated_data},
        return_document=True
    )

    if not result:
        raise HTTPException(status_code=404, detail="Профиль пользователя не найден")

    result["_id"] = str(result["_id"])
    result.pop("user_id", None)
    return result
