import React, { useState } from "react";
import Calendar from "./Calendar";
import PlantListSidebar from "./PlantListSidebar";
import styles from "../styles/DiaryPage.module.css";

const DiaryPage = () => {
  const [selectedPlant, setSelectedPlant] = useState(null);

  return (
    <div className={styles.diaryPage}>
      <div className={styles.sidebar}>
        <PlantListSidebar onSelectPlant={setSelectedPlant} />
      </div>
      <div className={styles.calendarContainer}>
        {selectedPlant ? (
          <Calendar plant={selectedPlant} />
        ) : (
          <p>Выберите растение слева</p>
        )}
      </div>
    </div>
  );
};

export default DiaryPage;