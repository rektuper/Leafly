import { useState } from "react";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";

function Register({ onRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    try {
      // 1. Регистрация (JSON)
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        // 2. Вход (FormData)
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const loginRes = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          body: formData,
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          localStorage.setItem("access_token", data.access_token);
          onRegister();
        } else {
          const error = await loginRes.json();
          alert(error.detail || "Ошибка при входе");
        }
      } else {
        const error = await res.json();
        alert(error.detail || "Ошибка регистрации");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка при регистрации");
    }
  };

  return (
      <div className="auth-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="register-form__heading">Регистрация</h2>
          <div className="register-form-input">
            <p>Имя пользователя:</p>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="register-form__input"
            />
          </div>
          <div className="register-form-input">
            <p>Электронная почта:</p>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="register-form__input"
            />
          </div>
          <div className="register-form-input">
            <p>Пароль:</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="register-form__input"
            />
          </div>
          <div className="register-form-input">
            <p>Подтверждение пароля:</p>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="register-form__input"
            />
          </div>
          <button type="submit" className="register-form__button">
            Зарегистрироваться
          </button>
          <p className="switch-auth">
            Уже есть аккаунт?{" "}
            <button type="button" onClick={() => navigate("/")} className="switch-to-log">
              Войти
            </button>
          </p>
        </form>

      </div>
  );
}

export default Register;
