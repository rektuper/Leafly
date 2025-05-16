import { useState } from "react";
import "../styles/header.css";
import { useLocation, useNavigate } from "react-router-dom";
import Burger from "./icons/Burger";

function Header({ isLoggedIn, username, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { label: "На главную", path: "/" },
        { label: "Личный кабинет", path: "/profile" },
        { label: "Избранное", path: "/favorites" },
        { label: "Мои растения", path: "/myplants" },
        { label: "Дневник по уходу", path: "/diary" },
        { label: "Подбор растения", path: "/selection" },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setMenuOpen(false);
    };

    return (
        <header className="header">
            <button className="logo-btn" onClick={() => navigate("/")}>🌸leafly</button>

            {isLoggedIn ? (
                <div className="user-menu-container">
                    <div className="username-header" onClick={() => setMenuOpen(!menuOpen)}>
                        <button className="username-btn">{username}</button>
                        <div className="burger-icon">
                            <Burger />
                        </div>
                    </div>

                    {menuOpen && (
                        <div className="dropdown-menu">
                            {menuItems.map((item) => (
                                <div
                                    key={item.path}
                                    className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                                    onClick={() => handleNavigate(item.path)}
                                >
                                    {item.label}
                                </div>
                            ))}
                            <div className="menu-item logout" onClick={handleLogoutClick}>
                                Выйти
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="auth-buttons">
                    <button className="auth-btn" onClick={() => navigate("/login")}>Войти</button>
                    <button className="auth-btn" onClick={() => navigate("/register")}>Зарегистрироваться</button>
                </div>
            )}
        </header>
    );
}

export default Header;