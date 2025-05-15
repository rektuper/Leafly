import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// Заглушки для остальных страниц
const Room = () => <h2 style={{ padding: "1rem" }}>🛏 Моя комната</h2>;
const Diary = () => <h2 style={{ padding: "1rem" }}>📔 Дневник по уходу</h2>;

// Компонент для защиты приватных роутов
function PrivateRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
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
          {!isLoggedIn ? (
            <>
              <Route path="/register" element={<Register onRegister={handleLogin} goToLogin={() => {}} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} goToRegister={() => {}} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />

            </>
          ) : (
            <>
              <Route path="/" element={ <MainPage/>}/>
              <Route
                path="/profile"
                element={
                  <PrivateRoute isLoggedIn={isLoggedIn}>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/myplants" element={<MyPlants />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="/selection" element={<SelectionPage />} />
              <Route path="/favorites" element={<FavoritePage />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
