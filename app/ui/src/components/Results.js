import React, { useEffect, useState } from "react";
import RecommendedPlantCard from "./RecommendedPlantCard";
import "../styles/Results.css";

function Results({ results = [], onReset }) {
  const [favoritePlantNames, setFavoritePlantNames] = useState([]);
  const token = localStorage.getItem("access_token");

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

  const handleFavoriteToggle = async (plantName) => {
    if (!token) {
      alert("Пожалуйста, войдите в систему, чтобы добавлять в избранное");
      return;
    }

    const isFavorite = favoritePlantNames.includes(plantName);
    const url = isFavorite
      ? "http://localhost:8000/profile/favorites/remove"
      : "http://localhost:8000/profile/favorites/add";

    const method = isFavorite ? "DELETE" : "POST";

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
        isFavorite
          ? prev.filter((name) => name !== plantName)
          : [...prev, plantName]
      );
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="results">
      {results.length > 0 ? (
        <>
          <div className="res">
            <div className="best">
              <h3>🌟 Идеальные совпадения</h3>
              {results.slice(0, 2).length > 0 && (
                <div className="coincidence">
                  <div className="cards">
                    {results.slice(0, 2).map((item, index) => (
                      <RecommendedPlantCard
                        key={item.plant.id || index}
                        item={item}
                        isFavorite={favoritePlantNames.includes(item.plant.name)}
                        onToggleFavorite={() =>
                          handleFavoriteToggle(item.plant.name)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="good">
              <h3>👍 Также могут подойти</h3>
              {results.slice(2).length > 0 && (
                <div className="coincidence">
                  {results.slice(2).map((item, index) => (
                    <RecommendedPlantCard
                      key={item.plant.id || index}
                      item={item}
                      isFavorite={favoritePlantNames.includes(item.plant.name)}
                      onToggleFavorite={() =>
                        handleFavoriteToggle(item.plant.name)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="again-btn">
            <button onClick={onReset}>🔁 Хотите еще?</button>
          </div>
        </>
      ) : (
        <p>Ничего не найдено 🤷‍♀️</p>
      )}
    </div>
  );
}

export default Results;
