import { useState } from "react";
import "../styles/Form.css"

const options = {
  light: ["яркое", "рассеянный", "полутень", "тень"],
  temperature: ["высокая", "умеренная", "холодная"],
  humidity: ["сухо", "средне", "влажно"],
  experience: ["новичок", "средний", "опытный"],
  space: ["маленькое", "среднее", "большое"]
};

function Form({ onSubmit }) {
  const [criteria, setCriteria] = useState({
    light: "",
    temperature: "",
    humidity: "",
    experience: "",
    space: ""
  });

  const handleChange = (e) => {
    setCriteria({ ...criteria, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(criteria);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {Object.keys(options).map((key) => (
        <label key={key}>
          {key.charAt(0).toUpperCase() + key.slice(1)}:
          <select
            name={key}
            value={criteria[key]}
            onChange={handleChange}
            required
          >
            <option value="">-- Выберите --</option>
            {options[key].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button type="submit">🔍 Подобрать</button>
    </form>
  );
}

export default Form;
