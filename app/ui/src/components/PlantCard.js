import React, { useState, useEffect } from "react";
import "../styles/PlantCard.css";
import { FaHeart, FaRegHeart, FaInfoCircle, FaTimes } from "react-icons/fa";

function PlantCard({ plant, isFavorite, onToggleFavorite }) {
  const [showModal, setShowModal] = useState(false);
  const [careText, setCareText] = useState("");

  const handleInfo = async () => {
    try {
      const res = await fetch(`http://localhost:8000/care/${plant.name}`);
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
      <div className="plant-card">
        <div className="plant-image">
          <img
              src={`/photos/${plant.name.replace(/\s+/g, "")}.jpg`}
              alt={plant.name}
          />
        </div>
        <div className="plant-content">
          <h3 className="plant-name">{plant.name}</h3>
          <ul className="plant-details">
            <li><strong>Свет:</strong> {plant.light}</li>
            <li><strong>Влажность:</strong> {plant.humidity}</li>
            <li><strong>Температура:</strong> {plant.temperature}</li>
            <li><strong>Опыт:</strong> {plant.experience}</li>
            <li><strong>Пространство:</strong> {plant.space}</li>
          </ul>

          <div className="plant-card-buttons">
            {isFavorite ? (
              <FaHeart
                className="icon favorite"
                onClick={onToggleFavorite}
                title="Удалить из избранного"
                style={{ color: "red", cursor: "pointer" }}
              />
            ) : (
              <FaRegHeart
                className="icon"
                onClick={onToggleFavorite}
                title="Добавить в избранное"
                style={{ cursor: "pointer" }}
              />
            )}
            <FaInfoCircle
              className="icon"
              onClick={handleInfo}
              title="Рекомендации по уходу"
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
            <h3>Рекомендации по уходу за: {plant.name}</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>{careText}</pre>
          </div>
        </div>
      )}
    </>
  );
}


export default PlantCard;
