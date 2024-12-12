import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import Cookies from "js-cookie";
import { database } from "./firebaseConfig";
import CustomNotification from "./CustomNotification";
import "./PixelBattle.css";

const GRID_SIZE = 100;
const PIXEL_SIZE = 15;

function PixelBattle() {
  const [pixels, setPixels] = useState([]);
  const [selectedColor, setSelectedColor] = useState("#0000ff");
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = Cookies.get("username");
    if (savedUsername) setUsername(savedUsername);

    // Загружаем пиксели из Firebase
    const pixelsRef = ref(database, "pixels");
    onValue(pixelsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPixels(data);
      } else {
        const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
          Array(GRID_SIZE).fill("#ffffff")
        );
        setPixels(emptyGrid);
      }
    });

    // Загружаем сообщения из Firebase
    const chatRef = ref(database, "chat");
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      setChatMessages(data ? Object.values(data) : []);
    });
  }, []);

  const handlePaint = (x, y) => {
    const now = new Date().getTime();
    const lastPaintTime = Cookies.get("lastPaintTime");

    if (lastPaintTime && now - lastPaintTime < 300000) {
      addNotification("Вы можете рисовать только раз в 5 минут!", "warning");
      return;
    }

    const updatedGrid = [...pixels];
    updatedGrid[x][y] = selectedColor;

    // Сохраняем изменения в Firebase
    set(ref(database, `pixels`), updatedGrid);

    Cookies.set("lastPaintTime", now, { expires: 7 });
    addNotification("Успешно закрашено!", "success");
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const message = {
        username: username || "Аноним",
        text: chatInput,
        timestamp: new Date().toISOString(),
      };

      const newMessageKey = Date.now();
      set(ref(database, `chat/${newMessageKey}`), message);

      setChatInput("");
    }
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  return (
    <div className="battle-container">
      <h1 className="title">Pixel Battle</h1>
      <div className="content">
        <div className="left-panel">
          <div className="toolbar">
            <label htmlFor="color">Выберите цвет:</label>
            <input
              type="color"
              id="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
          <div className="grid-container">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${PIXEL_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, ${PIXEL_SIZE}px)`,
              }}
            >
              {pixels.map((row, x) =>
                row.map((color, y) => (
                  <div
                    key={`${x}-${y}`}
                    className="pixel"
                    style={{
                      backgroundColor: color,
                      width: PIXEL_SIZE,
                      height: PIXEL_SIZE,
                    }}
                    onClick={() => handlePaint(x, y)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Чат */}
        <div className="right-panel">
          <div className="chat">
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className="chat-message">
                  <strong>{message.username}:</strong> {message.text}
                </div>
              ))}
            </div>
            <form className="chat-form" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Введите сообщение..."
              />
              <button type="submit">Отправить</button>
            </form>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      {notifications.map((notif) => (
        <CustomNotification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          onClose={() =>
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
          }
        />
      ))}
    </div>
  );
}

export default PixelBattle;
