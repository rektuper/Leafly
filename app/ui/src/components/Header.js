import { useState } from "react";
import "../styles/header.css";
import { useLocation, useNavigate } from "react-router-dom";

function Header({ isLoggedIn, username, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "На главную", path: "/" },
    { label: "Личный кабинет", path: "/profile" },
    { label: "Дневник по уходу", path: "/diary" },
    { label: "Мои растения", path: "/myplants" },
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
      <h1>🌸leafly</h1>
      {isLoggedIn && (
        <div className="user-menu-container">
          <button className="username-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {username}
          </button>
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
