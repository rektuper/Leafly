import PlantCard from "./PlantCard";

function Results({ results }) {
  return (
    <div className="results">
      {results.length > 0 ? (
        <>
          <h2>Результаты</h2>
          {results.slice(0, 2).length > 0 && (
            <div>
              <h3>🌟 Идеальные совпадения</h3>
              <div className="cards">
                {results.slice(0, 2).map((item, index) => (
                  <PlantCard item={item} key={index} />
                ))}
              </div>
            </div>
          )}

          {results.slice(2).length > 0 && (
            <div>
              <h3>👍 Также могут подойти</h3>
              <div className="cards">
                {results.slice(2).map((item, index) => (
                  <PlantCard item={item} key={index + 100} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Ничего не найдено 🤷‍♀️</p>
      )}
    </div>
  );
}

export default Results;
