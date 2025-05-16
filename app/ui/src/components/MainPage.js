import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MainPage.css";

function MainPage({ username }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/selection");
  };

  return (
      <div className="main-content">

          <div className="photos">
              <img src="../img/Rectangle3.png" alt=""/>
              <img src="../img/Rectangle4.png" alt=""/>
              <img src="../img/Rectangle5.png" alt=""/>
              <img src="../img/Rectangle6.png" alt=""/>
          </div>

          <div className="discription">
              <h1>Превратите свой дом в оазис зелени!</h1>
              <p>
                  Добро пожаловать в мир, где растения оживают с помощью знаний и заботы. Неважно, новичок вы или
                  опытный садовод – мы поможем выбрать идеальное растение, подскажем, как за ним ухаживать, и вместе
                  создадим уютный зеленый уголок.
                  Откройте для себя радость общения с природой – начните свое путешествие уже сейчас!
              </p>
          </div>

          <div className="to-recomend">
              <h2 className="question">Хотите попробовать подобрать себе растение?</h2>
              <button className="to-expert" onClick={handleNavigate}>Подобрать</button>
          </div>


      </div>
  );
}

export default MainPage;