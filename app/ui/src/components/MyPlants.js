import {useEffect, useState} from "react";
import "../styles/MyPlants.css";
import SearchableDropdown from "./SearchableDropdown"; // путь поправь, если нужно

function MyPlants() {
    const [myPlants, setMyPlants] = useState([]);
    const [allPlants, setAllPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState("");
    const token = localStorage.getItem("access_token");

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
                                <div className="plant-card" key={index}>
                                    <img
                                        src={`http://localhost:3000/photos/${plant.path}`}
                                        alt={plant.name}
                                    />
                                    <h3>{plant.name}</h3>
                                    <div className="card-buttons">
                                        <button className="action-button" title="Информация">Информацияℹ️</button>
                                        <button className="action-button" title="Дневник">Дневник 📔</button>
                                        <button className="action-button" title="Удалить"
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
