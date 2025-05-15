import { useState } from "react";
import Form from "./Form";
import Results from "./Results";
import "../styles/SelectionPage.css";

function SelectionPage() {
  const [results, setResults] = useState([]);

  const handleSearch = async (criteria) => {
    try {
      const response = await fetch("http://localhost:8000/recommend_plants/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) throw new Error("Ошибка при получении рекомендаций");

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  return (
    <div className="selection-page">
      <div className="form-container">
        <Form onSubmit={handleSearch} />
      </div>
      <div className="results-container">
        <Results results={results} />
      </div>
    </div>
  );
}

export default SelectionPage;
