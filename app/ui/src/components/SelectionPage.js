import React, { useState } from "react";
import Form from "../components/Form";
import Results from "../components/Results";
import "../styles/SelectionPage.css";

function SelectionPage() {
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(true);

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
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  const handleReset = () => {
    setResults([]);
    setShowForm(true);
  };

  return (
    <div className="selection-page-content">
      <h1 className="selection-page-title">Система подбора растения</h1>
      <div className="selection-page">
        {showForm && (
          <div className="form-container">
            <Form onSubmit={handleSearch} />
          </div>
        )}
        {!showForm && (
          <div className="results-container full-width">
            <Results results={results} onReset={handleReset} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectionPage;
