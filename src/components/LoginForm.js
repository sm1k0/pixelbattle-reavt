import React, { useState } from "react";
import axios from "axios";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return alert("Введите имя пользователя!");

    try {
      // Проверка на уникальность имени
      const response = await axios.get("http://localhost:3001/users");
      const existingUser = response.data.find((user) => user.username === username);

      if (existingUser) {
        setError("Имя пользователя уже существует!");
        return;
      }

      // Сохраняем нового пользователя
      await axios.post("http://localhost:3001/users", { username });

      // Передаем данные в родительский компонент
      onLogin(username);
    } catch (error) {
      console.error("Ошибка при добавлении пользователя:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введите имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}

export default LoginForm;
