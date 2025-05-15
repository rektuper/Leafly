import {useEffect, useState} from "react";
import "../styles/Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

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
        setFormData({...formData, [e.target.name]: e.target.value});
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

    return (
        <div className="profile-container">
            <h2>👤 Профиль пользователя</h2>
            <div className="profile-grid">
                {["name", "surname", "lastname", "city", "notes"].map((field) => (
                    <div key={field} className="profile-field">
                        <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                        {editing ? (
                            <input
                                name={field}
                                value={formData[field] || ""}
                                onChange={handleChange}
                            />
                        ) : (
                            <p>{profile[field]}</p>
                        )}
                    </div>
                ))}
                <div className="profile-field">
                    <label>Цветы:</label>
                    {editing ? (
                        <input
                            name="colors"
                            value={formData.colors?.join(", ") || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    colors: e.target.value.split(",").map((s) => s.trim()),
                                })
                            }
                        />
                    ) : (
                        <p>{profile.colors?.join(", ")}</p>
                    )}
                </div>
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