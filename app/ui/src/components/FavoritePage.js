import { useEffect, useState } from "react";

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
      console.log(data)
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

      // Обновляем список
      setFavorites((prev) => prev.filter((p) => p.name !== plantName));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div>Загрузка избранного...</div>;

  if (favorites.length === 0) return <div>Избранных растений нет.</div>;

  return (
    <div>
      <h2>🌿 Избранные растения</h2>
      <div className="favorites-grid">
        {favorites.map((plant) => (
          <div
            key={plant.name}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              width: "200px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            <img
              src={ `/photos/${plant.name}.jpg`}
              alt={plant.name}
              style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px" }}
            />
            <h3 style={{ marginTop: "0.5rem" }}>{plant.name}</h3>
            <button
              onClick={() => removeFavorite(plant.name)}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                backgroundColor: "#ff6b6b",
                border: "none",
                color: "white",
                borderRadius: "4px",
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
              }}
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
