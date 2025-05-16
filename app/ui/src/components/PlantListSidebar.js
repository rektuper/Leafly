import React, {useEffect, useState} from "react";
import axios from "axios";
import "../styles/PlantListSidebar.css";

const PlantListSidebar = ({onSelectPlant}) => {
    const [plants, setPlants] = useState([]);
    const [search, setSearch] = useState("");
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        axios.get("http://localhost:8000/auth/profile/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                setPlants(res.data.colors || []);
            })
            .catch((err) => console.error(err));
    }, [token]);

    const filtered = plants.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="sidebarContainer">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск растения"
                className="searchInput"
            />
            <ul className="plantList">
                {filtered.map((name) => (
                    <li
                        key={name}
                        className="plantItem"

                        onClick={() => {
                            onSelectPlant(name);
                        }}
                    >
                        {name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlantListSidebar;
