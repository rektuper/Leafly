import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "../styles/Calendar.css";

const actionsList = [
  { icon: "Полив", label: "💧" },
  { icon: "Подкормка", label: "🧴" },
  { icon: "Подезание листьев", label: "✂️" },
  { icon: "Опрыскивание листьев", label: "💦" },
];

const Calendar = ({ plant }) => {
  const [notes, setNotes] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);
  // Новый стейт для выбранных в модалке действий (локально, до сохранения)
  const [modalSelectedActions, setModalSelectedActions] = useState([]);

  const daysInMonth = currentDate.daysInMonth();
  const year = currentDate.year();
  const month = currentDate.month();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/calendar/${plant}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((res) => {
        const notesByDay = {};
        for (const entry of res.data) {
          const date = dayjs(entry.date);
          if (date.year() === year && date.month() === month) {
            const day = date.date();
            if (!notesByDay[day]) notesByDay[day] = [];
            notesByDay[day].push(...entry.actions);
          }
        }
        setNotes(notesByDay);
      })
      .catch((err) => console.error(err));
  }, [plant, year, month]);

  // При открытии модалки — копируем действия из notes для выбранного дня в локальный стейт
  useEffect(() => {
    if (selectedDay !== null) {
      setModalSelectedActions(notes[selectedDay] ? [...notes[selectedDay]] : []);
    }
  }, [selectedDay, notes]);

  const toggleActionInModal = (action) => {
    if (modalSelectedActions.includes(action)) {
      setModalSelectedActions((prev) => prev.filter((a) => a !== action));
    } else {
      setModalSelectedActions((prev) => [...prev, action]);
    }
  };

  // Функция сохранения изменений (вызывается при крестике или Esc)
  const saveActions = () => {
    if (selectedDay === null) return;

    const dateString = dayjs(new Date(year, month, selectedDay)).format("YYYY-MM-DD");

    axios
      .post(
        "http://localhost:8000/calendar/add",
        {
          plant_name: plant,
          entry: {
            date: dateString,
            actions: modalSelectedActions,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )
      .then(() => {
        setNotes((prev) => ({
          ...prev,
          [selectedDay]: modalSelectedActions,
        }));
        setSelectedDay(null);
      })
      .catch((err) => console.error(err));
  };

  // Отмена — закрыть модалку без сохранения
  const cancelModal = () => {
    setSelectedDay(null);
  };

  // Обработчик нажатия Esc — закрыть и сохранить
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && selectedDay !== null) {
        saveActions();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalSelectedActions, selectedDay]);

  return (
    <div className="calendar-page">
      <h2 className="calendar-plant-name"> Растение: {plant}</h2>
      <div className="calendar-Header">
        <button
          className="calendar-move-btn"
          onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
        >
          ← Предыдущий
        </button>
        <h2 className="month-Title">{currentDate.format("MMMM YYYY")}</h2>
        <button
          className="calendar-move-btn"
          onClick={() => setCurrentDate(currentDate.add(1, "month"))}
        >
          Следующий →
        </button>
      </div>
      <div className="calendar-Grid">
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const hasNotes = notes[day]?.length;
          return (
            <div
              key={day}
              className={`calendar-Day ${hasNotes ? "has-notes" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="day-Number">{day}</div>
              <ul className="notes-List">
                {(notes[day] || []).map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {selectedDay !== null && (
          <div className="modal">
            <div className="modal-content" style={{position: "relative"}}>
              <button
                  className="modal-close-button"
                  aria-label="Закрыть и сохранить"
                  onClick={saveActions}
              >
                &times;
              </button>
              <h3>
                Выберите действие для {selectedDay} {currentDate.format("MMMM")}
              </h3>
              <div className="actions-grid">
                {actionsList.map(({icon, label}) => {
                  const isSelected = modalSelectedActions.includes(label);
                  return (
                      <button
                          key={label}
                          onClick={() => toggleActionInModal(label)}
                          className={`action-button ${isSelected ? "selected" : ""}`}
                      >
                    <span role="img" aria-label={icon} style={{fontSize: 18, marginRight: 8}}>
                      {label}
                    </span>{" "}
                        {icon}
                      </button>
                  );
                })}
              </div>
              <button onClick={cancelModal} className="cancel-button" style={{marginTop: 20}}>
                Отмена
              </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default Calendar;
