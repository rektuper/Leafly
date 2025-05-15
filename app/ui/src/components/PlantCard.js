import "../styles/PlantCard.css"
function PlantCard({ item }) {
  return (
    <div className="plant-card">
      <h2>{item.plant.name}</h2>
      <img
        src={item.plant.path.startsWith("http") ? item.plant.path : `/photos/${item.plant.path}`}
        alt={item.plant.name}
        style={{ width: "200px", height: "auto" }}
      />
      <p>
        Оценка соответствия: <strong>{item.score}</strong>
      </p>
      <ul>
        {item.explanation.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export default PlantCard;
