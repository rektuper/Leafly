import { useState, useRef, useEffect } from "react";
import "../styles/SearchableDropdown.css";

function SearchableDropdown({ allPlants, selectedPlant, setSelectedPlant }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef(null);

  const filteredPlants = allPlants
    .filter((plant) => plant.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name) => {
    setSelectedPlant(name);
    setIsOpen(false);
    setFilter("");
  };

  return (
    <div className="searchable-dropdown" ref={containerRef}>
      <input
        type="text"
        placeholder="Выберите растение..."
        value={isOpen ? filter : selectedPlant}
        onChange={(e) => {
          setFilter(e.target.value);
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <ul>
          {filteredPlants.length > 0 ? (
            filteredPlants.map((plant) => (
              <li
                key={plant.name}
                onClick={() => handleSelect(plant.name)}
                className={selectedPlant === plant.name ? "selected" : ""}
              >
                {plant.name}
              </li>
            ))
          ) : (
            <li className="no-results">Ничего не найдено</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchableDropdown;
