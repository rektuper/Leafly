import {useEffect, useState} from "react";
import "../styles/MyPlants.css";

function MyPlants() {
    const [myPlants, setMyPlants] = useState([]);
    const [allPlants, setAllPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState("");
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        fetch("http://localhost:8000/auth/profile/me", {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => res.json())
            .then(data => setMyPlants(data.colors || []));

        fetch("http://localhost:8000/all")
            .then(res => res.json())
            .then(data => setAllPlants(data));
    }, []);


const handleDeletePlant = async (plantName) => {
    const res = await fetch("http://localhost:8000/profile/remove_plant", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(plantName)
    });

    if (res.ok) {
        setMyPlants(prev => prev.filter(name => name !== plantName));
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
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(selectedPlant)
        });

        if (res.ok) {
            setMyPlants(prev => [...prev, selectedPlant]);
            setSelectedPlant("");
        } else {
            alert("Ошибка при добавлении растения");
        }
    };

    return (
        <div className="my-plants-container">
            <h2>🌿 Мои растения</h2>

            {myPlants.length === 0 ? (
                <p>У вас пока нет растений. Хотите добавить?</p>
            ) : (
                <div className="plant-cards">
                    {myPlants.map((name, index) => {
                        const plant = allPlants.find(p => p.name === name); // или p.name.toLowerCase() === name.toLowerCase()
                        if (!plant) return null;

                        return (
                            <div className="plant-card" key={index}>
                                <img src={`http://localhost:3000/photos/${plant.path}`} alt={plant.name}/>
                                <h3>{plant.name}</h3>
                                <div className="card-buttons">
                                    <button title="Удалить" onClick={() => handleDeletePlant(plant.name)}>🗑️</button>
                                    <button title="Дневник">📔</button>
                                    <button title="Информация">ℹ️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="add-plant-section">
                <select value={selectedPlant} onChange={e => setSelectedPlant(e.target.value)}>
                    <option value="">Выберите растение</option>
                    {allPlants.map(plant => (
                        <option key={plant.name} value={plant.name}>
                            {plant.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddPlant}>➕ Добавить</button>
            </div>
        </div>
    );
}

export default MyPlants;
