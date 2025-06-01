import React, { useState, useEffect } from "react";
import PlantCard from "./PlantCard";
import "../styles/AllPlantsPage.css";

export default function AllPlantsPage() {
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

  // Загрузка растений с учётом фильтров и поиска
  useEffect(() => {
    const queryParams = new URLSearchParams({
      search,
      ...filters,
    });

    fetch(`http://localhost:8000/all?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => setPlants(data))
      .catch((err) => console.error("Ошибка загрузки растений:", err));
  }, [filters, search]);

  // Загрузка избранного
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

  // Обработчик изменения фильтра
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик переключения избранного (добавление/удаление)
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
          <option value="Тень">Тень</option>
        </select>

        <select name="humidity" value={filters.humidity} onChange={handleFilterChange}>
          <option value="">Влажность</option>
          <option value="Низкая">Низкая</option>
          <option value="Средняя">Средняя</option>
          <option value="Высокая">Высокая</option>
        </select>

        <select name="temperature" value={filters.temperature} onChange={handleFilterChange}>
          <option value="">Температура</option>
          <option value="Низкая">Низкая</option>
          <option value="Средняя">Средняя</option>
          <option value="Высокая">Высокая</option>
        </select>

        <select name="experience" value={filters.experience} onChange={handleFilterChange}>
          <option value="">Опыт</option>
          <option value="Новичок">Новичок</option>
          <option value="Продвинутый">Продвинутый</option>
        </select>

        <select name="space" value={filters.space} onChange={handleFilterChange}>
          <option value="">Пространство</option>
          <option value="Маленькое">Маленькое</option>
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
