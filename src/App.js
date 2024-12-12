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

  return (
    <div>
      {!user ? (
        <LoginForm onLogin={(userData) => setUser(userData)} />
      ) : (
        <PixelBattle user={user} />
      )}
    </div>
  );
}

export default App;
