import {useState} from "react";
import "../styles/header.css";
import {useLocation, useNavigate} from "react-router-dom";
import Burger from "./icons/Burger";

function Header({isLoggedIn, username, onLogout}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {label: "На главную", path: "/"},
        {label: "Личный кабинет", path: "/profile"},
        {label: "Мои растения", path: "/myplants"},
        {label: "Избранное", path: "/favorites"},
        {label: "Дневник по уходу", path: "/diary"},
        {label: "Подбор растения", path: "/selection"},

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
            {isLoggedIn && (
                <div className="user-menu-container">
                    <div className="username-header">
                        <button className="username-btn" onClick={() => setMenuOpen(!menuOpen)}>
                            {username}
                        </button>
                        <Burger/>
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
            )}
        </header>
    );
}

export default Header;
