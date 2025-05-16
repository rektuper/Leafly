import { useEffect, useState } from "react";
import "../styles/FavoritePage.css";

function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/profile/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Ошибка загрузки избранного");
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (plantName) => {
    if (!window.confirm(`Удалить ${plantName} из избранного?`)) return;

    try {
      const res = await fetch("http://localhost:8000/profile/favorites/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plantName),
      });
      if (!res.ok) throw new Error("Ошибка удаления из избранного");

      setFavorites((prev) => prev.filter((p) => p.name !== plantName));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="loading">Загрузка избранного...</div>;

  if (favorites.length === 0)
    return <div className="empty">Избранных растений нет.</div>;

  return (
    <div className="favoritePageContainer">
      <h2 className="title">🌿 Избранные растения</h2>
      <div className="favoritesGrid">
        {favorites.map((plant) => (
          <div key={plant.name} className="plantCard">
            <img
              src={`/photos/${plant.name}.jpg`}
              alt={plant.name}
              className="plantImage"
            />
            <h3 className="plantName">{plant.name}</h3>
            <button
              className="removeButton"
              onClick={() => removeFavorite(plant.name)}
              title="Удалить из избранного"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoritePage;
