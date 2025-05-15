import { useState, useEffect } from "react";
import "../styles/PlantCard.css";
import { FaHeart, FaRegHeart, FaInfoCircle } from "react-icons/fa";

function PlantCard({ item, favoritePlants, onFavoriteChange }) {
  // favoritePlants — массив названий растений из родителя (или null)

  const [isFavorite, setIsFavorite] = useState(false);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (favoritePlants) {
      setIsFavorite(favoritePlants.includes(item.plant.name));
    }
  }, [favoritePlants, item.plant.name]);

  const handleFavorite = async () => {
    if (!token) {
      alert("Пожалуйста, войдите в систему, чтобы добавлять в избранное");
      return;
    }

    try {
      if (isFavorite) {
        // Удаляем из избранного
        const res = await fetch("http://localhost:8000/profile/favorites/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item.plant.name),
        });
        if (!res.ok) throw new Error("Ошибка при удалении из избранного");
        setIsFavorite(false);
        onFavoriteChange && onFavoriteChange(item.plant.name, false);
      } else {
        // Добавляем в избранное
        const res = await fetch("http://localhost:8000/profile/favorites/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(item.plant.name),
        });
        if (!res.ok) throw new Error("Ошибка при добавлении в избранное");
        setIsFavorite(true);
        onFavoriteChange && onFavoriteChange(item.plant.name, true);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleInfo = () => {
    console.log("Показать информацию:", item.plant.name);
  };

  return (
    <div className="plant-card-recomend">
      <div className="plant-header">
        <h2>{item.plant.name}</h2>
      </div>
      <img
        src={item.plant.path.startsWith("http") ? item.plant.path : `/photos/${item.plant.path}`}
        alt={item.plant.name}
        style={{ width: "200px", height: "200px" }}
      />
      <ul>
        {item.explanation.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <div className="icons" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {isFavorite ? (
          <FaHeart
            className="icon favorite"
            onClick={handleFavorite}
            title="Удалить из избранного"
            style={{ color: "red", cursor: "pointer" }}
          />
        ) : (
          <FaRegHeart
            className="icon"
            onClick={handleFavorite}
            title="Добавить в избранное"
            style={{ cursor: "pointer" }}
          />
        )}
        <FaInfoCircle className="icon" onClick={handleInfo} title="Информация" style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
}

export default PlantCard;
