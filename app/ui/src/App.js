import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/Login";
import Header from "./components/Header";
import Profile from "./components/Profile";
import "./styles/App.css";
import MainPage from "./components/MainPage";
import MyPlants from "./components/MyPlants";
import SelectionPage from "./components/SelectionPage";
import FavoritePage from "./components/FavoritePage";
import DiaryPage from "./components/DiaryPage";
import AllPlantsPage from "./components/AllPlantsPage";

// Приватный маршрут с Outlet
function PrivateRoute({ isLoggedIn }) {
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogin = (name) => {
    setIsLoggedIn(true);
    setUsername(name);
    localStorage.setItem("username", name);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  const handleFormSubmit = async (criteria) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/recommend_plants/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(criteria),
      });

      if (res.status === 401) {
        alert("Сессия истекла. Войдите заново.");
        handleLogout();
        return;
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Ошибка при запросе. Убедитесь, что бэкенд запущен.");
    }
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
      <div className="content">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<MainPage />} />
          <Route path="/selection" element={<SelectionPage />} />
          <Route path="/all-plants" element={<AllPlantsPage />} />

          {/* Редиректы если уже залогинен */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} goToRegister={() => {}} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Register onRegister={handleLogin} goToLogin={() => {}} />
              )
            }
          />

          {/* Приватные маршруты */}
          <Route element={<PrivateRoute isLoggedIn={isLoggedIn} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/diary" element={<DiaryPage />} />
            <Route path="/myplants" element={<MyPlants />} />
            <Route path="/favorites" element={<FavoritePage />} />
          </Route>

          {/* На случай несуществующего пути */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
