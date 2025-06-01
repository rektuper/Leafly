import { useState, useEffect } from "react";
import "../styles/RecommendedPlantCard.css";
import { FaHeart, FaRegHeart, FaInfoCircle, FaTimes } from "react-icons/fa";

function RecommendedPlantCard({ item, favoritePlants, onFavoriteChange }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [careText, setCareText] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (favoritePlants) {
      setIsFavorite(favoritePlants.includes(item.plant.name));
    }
  }, [favoritePlants, item.plant.name]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFavorite = async () => {
    if (!token) {
      alert("Пожалуйста, войдите в систему, чтобы добавлять в избранное");
      return;
    }

    try {
      const url = isFavorite
        ? "http://localhost:8000/profile/favorites/remove"
        : "http://localhost:8000/profile/favorites/add";
      const method = isFavorite ? "DELETE" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item.plant.name),
      });

      if (!res.ok) throw new Error("Ошибка при обновлении избранного");

      setIsFavorite(!isFavorite);
      onFavoriteChange && onFavoriteChange(item.plant.name, !isFavorite);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleInfo = async () => {
    try {
      const res = await fetch(`http://localhost:8000/care/${item.plant.name}`);
      if (!res.ok) throw new Error("Ошибка при получении информации о растении");

      const data = await res.json();
      setCareText(data.care_recommendation);
      setShowModal(true);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            <h3>Рекомендации по уходу за: {item.plant.name}</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>{careText}</pre>
          </div>
        </div>
      )}
    </>
  );
}

export default RecommendedPlantCard;
