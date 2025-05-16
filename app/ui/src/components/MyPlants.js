import {useEffect, useState} from "react";
import "../styles/MyPlants.css";
import SearchableDropdown from "./SearchableDropdown";
import {useNavigate} from "react-router-dom"; // путь поправь, если нужно

function MyPlants() {
    const [myPlants, setMyPlants] = useState([]);
    const [allPlants, setAllPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState("");
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
                                        src={`http://localhost:3000/photos/${plant.path}`}
                                        alt={plant.name}
                                    />
                                    <h3>{plant.name}</h3>
                                    <div className="card-buttons">
                                        <button className="action-plant-button" title="Информация">Информацияℹ️</button>
                                        <button className="action-plant-button" title="Дневник" onClick={() => navigate("/diary")}>Дневник 📔</button>
                                        <button className="action-plant-button" title="Удалить"
                                                onClick={() => handleDeletePlant(plant.name)}>
                                            Удалить🗑️
                                        </button>


                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPlants;
