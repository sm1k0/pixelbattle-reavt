import React, { useState, useEffect } from "react";
import PixelBattle from "./components/PixelBattle";
import LoginForm from "./components/LoginForm";
import Cookies from "js-cookie";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Проверяем, есть ли имя пользователя в куках
    const storedUsername = Cookies.get("username");
    if (storedUsername) {
      setUser({ username: storedUsername });
    }
  }, []);

  const handleLogin = (username) => {
    // Сохраняем пользователя в куки
    Cookies.set("username", username, { expires: 7 });
    setUser({ username });
  };

  return (
    <div>
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <PixelBattle user={user} />
      )}
    </div>
  );
}

export default App;
