import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import styles from "../styles/Calendar.css";

const actionsList = [
  { icon: "💧Полив", label: "💧" },
  { icon: "🧴Подкормка", label: "🧴" },
  { icon: "✂️Подстриг", label: "✂️" },
  { icon: "💦Опрыскивание листьев", label: "💦" },
];

const Calendar = ({ plant }) => {
  const [notes, setNotes] = useState({});
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);

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
          const day = dayjs(entry.date).date();
          if (!notesByDay[day]) notesByDay[day] = [];
          notesByDay[day].push(...entry.actions);
        }
        setNotes(notesByDay);
      })
      .catch((err) => console.error(err));
  }, [plant, year, month]);

  const handleAddAction = (action) => {
  const day = selectedDay;
  if (!day) return;

  const dateString = dayjs(new Date(year, month, day)).format("YYYY-MM-DD");

  axios
    .post(
      "http://localhost:8000/calendar/add",
      {
        plant_name: plant,
        entry: {
          date: dateString,
          actions: [action],
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
        [day]: [...(prev[day] || []), action],
      }));
      setSelectedDay(null);
    })
    .catch((err) => console.error(err));
};

  return (
    <div className="calendar-page">
      <h2 className="calendar-plant-name">{plant}</h2>
      <div className="calendar-Header">
        <button className="calendar-move-btn" onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}>
          ← Предыдущий
        </button>
        <h2 className="month-Title">{currentDate.format("MMMM YYYY")}</h2>
        <button className="calendar-move-btn" onClick={() => setCurrentDate(currentDate.add(1, "month"))}>
          Следующий →
        </button>
      </div>
      <div className="calendar-Grid">
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          return (
            <div key={day} className="calendar-Day" onClick={() => setSelectedDay(day)}>
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
          <div className="modal-content">
            <h3>Выберите действие для {selectedDay} {currentDate.format("MMMM")}</h3>
            <div className="actions-grid">
              {actionsList.map(({ icon, label }) => (
                <button key={label} onClick={() => handleAddAction(label)} className="action-button">
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedDay(null)} className="cancel-button">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;