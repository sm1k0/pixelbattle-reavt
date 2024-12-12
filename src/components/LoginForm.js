import React, { useState } from "react";
import { getDatabase, ref, get, set } from "firebase/database";
import "./LoginForm.css"; // Подключаем CSS файл

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return alert("Введите имя пользователя!");

    try {
      const db = getDatabase();
      const usersRef = ref(db, "users");

      // Загружаем всех пользователей
      const snapshot = await get(usersRef);
      const users = snapshot.exists() ? snapshot.val() : {};

      // Проверяем, существует ли пользователь
      const existingUser = Object.values(users).find(
        (user) => user.username === username
      );

      if (existingUser) {
        setError("Имя пользователя уже существует!");
        return;
      }

      // Добавляем нового пользователя
      const newUserId = `user_${Date.now()}`; // Уникальный ID пользователя
      const userRef = ref(db, `users/${newUserId}`);
      await set(userRef, { username });

      // Передаем данные в родительский компонент
      onLogin(username);
    } catch (error) {
      console.error("Ошибка при добавлении пользователя:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="typing-effect">Введите имя пользователя</div>
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
    </div>
  );
}

export default LoginForm;
