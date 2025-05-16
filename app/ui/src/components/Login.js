import { useState } from "react";
import "../styles/Login.css";
import User from "./icons/User";
import Lock from "./icons/Lock";
import { useNavigate } from "react-router-dom";

function Login({ onLogin, goToRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Ошибка при входе");
        return;
      }

      const data = await res.json();
      const token = data.access_token;
      localStorage.setItem("access_token", token);

      // Запрос текущего пользователя
      const userRes = await fetch("http://localhost:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRes.ok) {
        alert("Не удалось получить имя пользователя");
        return;
      }

      const userData = await userRes.json();
      const currentUsername = userData.username;

      localStorage.setItem("username", currentUsername);
      onLogin(currentUsername); // передаём в App
    } catch (err) {
      console.error(err);
      alert("Ошибка при входе");
    }
  };

  return (
    <div className="auth-container">

      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>
        <div className="login-form-input">
          <User className={`user-icon-small`}/>
          <input
              placeholder="Имя пользователя"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
          />
        </div>

        <div className="login-form-input">
          <Lock className={`lock-icon-small`}/>
          <input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
        </div>
        <button className="sumit-btn" type="submit" onClick={() => navigate("/")}>Войти</button>
        <p className="switch-auth">
          Нет аккаунта?{" "}
          <button type="button" className="switch-to-reg" onClick={() => navigate("/register")}>
            Зарегистрируйтесь
          </button>
        </p>
      </form>

    </div>
  );
}

export default Login;
