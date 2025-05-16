import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("http://localhost:8000/auth/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("Полученные данные профиля:", data);
      setProfile(data);
      setFormData(data);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const res = await fetch("http://localhost:8000/auth/profile/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
    } else {
      alert("Ошибка при сохранении профиля");
    }
  };

  if (!profile) return <div className="profile-container">Загрузка...</div>;

  // Поля, которые выводим и редактируем (без notes и colors)
  const visibleFields = ["name", "surname", "lastname", "city"];

  // Русские метки для полей
  const labels = {
    name: "Имя",
    surname: "Фамилия",
    lastname: "Отчество",
    city: "Город",
  };

  return (
    <div className="profile-container">
      <h2>👤 Профиль пользователя</h2>

      {/* Блок username и email */}
      <div className="profile-basic-info">
        <div>
          <strong>Логин:</strong> <span>{profile.username || "-"}</span>
        </div>
        <div>
          <strong>Email:</strong> <span>{profile.email || "-"}</span>
        </div>
      </div>

      <div className="profile-grid">
        {visibleFields.map((field) => (
          <div key={field} className="profile-field">
            <label>{labels[field]}:</label>
            {editing ? (
              <input
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
              />
            ) : (
              <p>{profile[field] || "-"}</p>
            )}
          </div>
        ))}
      </div>
      <div className="profile-buttons">
        {editing ? (
          <button onClick={handleSave}>💾 Сохранить</button>
        ) : (
          <button onClick={() => setEditing(true)}>✏️ Редактировать</button>
        )}
      </div>
    </div>
  );
}

export default Profile;
