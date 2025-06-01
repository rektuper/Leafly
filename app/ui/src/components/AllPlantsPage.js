import { useEffect, useState } from "react";
import PlantCard from "./PlantCard";
import "../styles/AllPlantsPage.css";

function AllPlantsPage() {
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    light: "",
    humidity: "",
    temperature: "",
    experience: "",
    space: ""
  });

  const [favoritePlants, setFavoritePlants] = useState([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch("http://localhost:8000/all")
      .then(res => res.json())
      .then(data => {
        setPlants(data);
        setFilteredPlants(data);
      });

    if (token) {
      fetch("http://localhost:8000/profile/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          // предполагается, что сервер возвращает массив имён растений
          setFavoritePlants(data);
        })
        .catch(() => {
          // можно обработать ошибку, например:
          console.warn("Не удалось загрузить избранное");
        });
    }
  }, [token]);

  useEffect(() => {
    let result = plants.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        if (key === "light") {
          result = result.filter(p => p.light.includes(filters[key]));
        } else {
          result = result.filter(p => p[key] === filters[key]);
        }
      }
    });

    setFilteredPlants(result);
  }, [search, filters, plants]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Функция, вызываемая из PlantCard при изменении избранного
  const handleFavoriteChange = (plantName, isFav) => {
    setFavoritePlants((prev) => {
      if (isFav) {
        if (!prev.includes(plantName)) return [...prev, plantName];
        return prev;
      } else {
        return prev.filter(name => name !== plantName);
      }
    });
  };

  return (
    <div className="all-plants-page">
      <h1>Все растения</h1>

      <div className="filters">
        {/* ... твои фильтры и поиск ... */}
      </div>

      <div className="plant-list">
        {filteredPlants.map((plant, idx) => (
          <PlantCard
            key={idx}
            item={{ plant, explanation: [] }}
            favoritePlants={favoritePlants}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>
    </div>
  );
}

export default AllPlantsPage;
