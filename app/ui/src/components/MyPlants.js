import {useEffect, useState} from "react";
import "../styles/MyPlants.css";
import { FaInfoCircle, FaTimes } from "react-icons/fa";
import SearchableDropdown from "./SearchableDropdown";
import {useNavigate} from "react-router-dom";

function MyPlants() {
    const [myPlants, setMyPlants] = useState([]);
    const [allPlants, setAllPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [careText, setCareText] = useState("");
    const [activePlantName, setActivePlantName] = useState("");
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8000/auth/profile/me", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => res.json())
            .then((data) => setMyPlants(data.colors || []));

        fetch("http://localhost:8000/all")
            .then((res) => res.json())
            .then((data) => setAllPlants(data));
    }, []);

    const handleDeletePlant = async (plantName) => {
        const res = await fetch("http://localhost:8000/profile/remove_plant", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(plantName),
        });

        if (res.ok) {
            setMyPlants((prev) => prev.filter((name) => name !== plantName));
        } else {
            alert("Ошибка при удалении растения");
        }
    };

    const handleAddPlant = async () => {
        if (!selectedPlant) return;

        const res = await fetch("http://localhost:8000/profile/add_plant", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(selectedPlant),
        });

        if (res.ok) {
            setMyPlants((prev) => [...prev, selectedPlant]);
            setSelectedPlant("");
        } else {
            alert("Ошибка при добавлении растения");
        }
    };

    const handleShowInfo = async (plantName) => {
        try {
            const res = await fetch(`http://localhost:8000/care/${plantName}`);
            if (!res.ok) throw new Error("Ошибка при получении информации о растении");

            const data = await res.json();
            setCareText(data.care_recommendation);
            setActivePlantName(plantName);
            setShowModal(true);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="my-plants-container">
            <h2>🌿 Мои растения</h2>
            <div className="my-plants">
                <div className="add-plant-section">
                    <SearchableDropdown
                        allPlants={allPlants}
                        selectedPlant={selectedPlant}
                        setSelectedPlant={setSelectedPlant}
                    />
                    <button onClick={handleAddPlant} className="add-plant-button">➕ Добавить</button>
                </div>

                {myPlants.length === 0 ? (
                    <p>У вас пока нет растений. Хотите добавить?</p>
                ) : (
                    <div className="plant-cards">
                        {myPlants.map((name, index) => {
                            const plant = allPlants.find((p) => p.name === name);
                            if (!plant) return null;
                            return (
                                <div className="my-plant-card" key={index}>
                                    <img
                                        src={`/photos/${plant.name.replace(/\s+/g, "")}.jpg`}
                                        alt={plant.name}
                                        style={{ width: "100%", height: "200px", objectFit: "contain" }}
                                    />
                                    <h3>{plant.name}</h3>
                                    <div className="card-buttons">
                                        <button
                                            className="action-plant-button"
                                            title="Информация"
                                            onClick={() => handleShowInfo(plant.name)}
                                        >
                                            Информация ℹ️
                                        </button>
                                        <button
                                            className="action-plant-button"
                                            title="Дневник"
                                            onClick={() => navigate("/diary")}
                                        >
                                            Дневник 📔
                                        </button>
                                        <button
                                            className="action-plant-button"
                                            title="Удалить"
                                            onClick={() => handleDeletePlant(plant.name)}
                                        >
                                            Удалить 🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            <FaTimes />
                        </button>
                        <h3>Рекомендации по уходу за: {activePlantName}</h3>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{careText}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyPlants;
