import RecommendedPlantCard from "./RecommendedPlantCard";
import "../styles/Results.css"

function Results({ results }) {
  return (
    <div className="results">
      {results.length > 0 ? (
          <>
            <h2>Результаты</h2>
            <h3>🌟 Идеальные совпадения</h3>
            {results.slice(0, 2).length > 0 && (
                <div className="coincidence">

                  <div className="cards">
                    {results.slice(0, 2).map((item, index) => (
                        <RecommendedPlantCard item={item} key={index}/>
                    ))}
                  </div>
                </div>
            )}
            <h3>👍 Также могут подойти</h3>
            {results.slice(2).length > 0 && (
                <div>

                  <div className="coincidence">
                    {results.slice(2).map((item, index) => (
                        <RecommendedPlantCard item={item} key={index + 100}/>
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
