import React, { useState, useEffect } from "react";
import PlantCard from "./PlantCard";
import "../styles/AllPlantsPage.css";

export default function AllPlantsPage() {
    const [allPlants, setAllPlants] = useState([]);
    const [plants, setPlants] = useState([]);
    const [favoritePlantNames, setFavoritePlantNames] = useState([]);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        light: "",
        humidity: "",
        temperature: "",
        experience: "",
        space: "",
    });

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        fetch("http://localhost:8000/all")
            .then((res) => res.json())
            .then((data) => {
                setAllPlants(data);
                setPlants(data);
            })
            .catch((err) => console.error("Ошибка загрузки растений:", err));
    }, []);

    useEffect(() => {
        const filterValueMap = {
            light: {
                Яркий: "яркое",
                Полутень: "полутень",
                Тень: "тень",
                Рассеянное: "рассеянный",
            },
            humidity: {
                Сухо: "сухо",
                Средне: "средне",
                Влажно: "влажно",
            },
            temperature: {
                Холодная: "холодная",
                Умеренная: "умеренная",
                Высокая: "высокая",
            },
            experience: {
                Новичок: "новичок",
                Средний: "средний",
                Опытный: "опытный",
            },
            space: {
                Маленькое: "маленькое",
                Среднее: "среднее",
                Большое: "большое",
            },
        };

        const filtered = allPlants.filter((plant) => {
            if (
                search.trim() !== "" &&
                !plant.name.toLowerCase().includes(search.trim().toLowerCase())
            ) {
                return false;
            }

            for (const [key, value] of Object.entries(filters)) {
                if (value) {
                    const mappedValue = filterValueMap[key]?.[value] ?? value;
                    const plantValue = plant[key];

                    if (key === "light") {
                        if (Array.isArray(plantValue)) {
                            const normalized = plantValue.map((v) => v.toLowerCase());
                            if (!normalized.includes(mappedValue.toLowerCase())) {
                                return false;
                            }
                        } else if (typeof plantValue === "string") {
                            if (!plantValue.toLowerCase().includes(mappedValue.toLowerCase())) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        if (
                            typeof plantValue === "string" &&
                            plantValue.toLowerCase() !== mappedValue.toLowerCase()
                        ) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });

        setPlants(filtered);
    }, [filters, search, allPlants]);

    useEffect(() => {
        if (!token) {
            setFavoritePlantNames([]);
            return;
        }

        fetch("http://localhost:8000/profile/favorites", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Ошибка загрузки избранного");
                return res.json();
            })
            .then((data) => {
                const favoriteNames = data.map((plant) => plant.name);
                setFavoritePlantNames(favoriteNames);
            })
            .catch(() => setFavoritePlantNames([]));
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleFavoriteToggle = async (plantName) => {
        if (!token) {
            alert("Пожалуйста, войдите в систему, чтобы добавлять в избранное");
            return;
        }

        const isCurrentlyFavorite = favoritePlantNames.includes(plantName);

        const url = isCurrentlyFavorite
            ? "http://localhost:8000/profile/favorites/remove"
            : "http://localhost:8000/profile/favorites/add";

        const method = isCurrentlyFavorite ? "DELETE" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ plant_name: plantName }),
            });

            if (!res.ok) throw new Error("Ошибка при обновлении избранного");

            setFavoritePlantNames((prev) =>
                isCurrentlyFavorite
                    ? prev.filter((name) => name !== plantName)
                    : [...prev, plantName]
            );
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="all-plants-page">
            <h1>Все растения</h1>

            <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />

            <div className="filters">
                <select name="light" value={filters.light} onChange={handleFilterChange}>
                    <option value="">Свет</option>
                    <option value="Яркий">Яркий</option>
                    <option value="Полутень">Полутень</option>
                    <option value="Тень">Тень</option>
                    <option value="Рассеянное">Рассеянное</option>
                </select>

                <select name="humidity" value={filters.humidity} onChange={handleFilterChange}>
                    <option value="">Влажность</option>
                    <option value="Сухо">Сухо</option>
                    <option value="Средне">Средне</option>
                    <option value="Влажно">Влажно</option>
                </select>

                <select name="temperature" value={filters.temperature} onChange={handleFilterChange}>
                    <option value="">Температура</option>
                    <option value="Холодная">Холодная</option>
                    <option value="Умеренная">Умеренная</option>
                    <option value="Высокая">Высокая</option>
                </select>

                <select name="experience" value={filters.experience} onChange={handleFilterChange}>
                    <option value="">Опыт</option>
                    <option value="Новичок">Новичок</option>
                    <option value="Средний">Средний</option>
                    <option value="Опытный">Опытный</option>
                </select>

                <select name="space" value={filters.space} onChange={handleFilterChange}>
                    <option value="">Пространство</option>
                    <option value="Маленькое">Маленькое</option>
                    <option value="Среднее">Среднее</option>
                    <option value="Большое">Большое</option>
                </select>
            </div>

            <div className="plant-list">
                {plants.map((plant) => (
                    <PlantCard
                        key={plant.id}
                        plant={plant}
                        isFavorite={favoritePlantNames.includes(plant.name)}
                        onToggleFavorite={() => handleFavoriteToggle(plant.name)}
                    />
                ))}
            </div>
        </div>
    );
}
