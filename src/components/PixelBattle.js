import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
  const [username, setUsername] = useState(""); // Имя пользователя

  useEffect(() => {
    // Загружаем имя пользователя из Cookies или из состояния (если оно уже задано)
    const savedUsername = Cookies.get("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }

    const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill("#ffffff")
    );
    setPixels(emptyGrid);

    fetchPixels();
    fetchMessages(); // Загружаем сообщения чата при загрузке страницы

    // Удаляем старые сообщения спустя 5 минут
    const interval = setInterval(() => {
      deleteOldMessages();
    }, 100); // Проверяем каждую минуту

    return () => clearInterval(interval); // Очистка интервала при размонтировании компонента
  }, []);

  const fetchPixels = async () => {
    try {
      const response = await axios.get("http://localhost:3001/pixels");
      const serverPixels = response.data;

      const updatedGrid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill("#ffffff")
      );

      serverPixels.forEach(({ x, y, color }) => {
        updatedGrid[x][y] = color;
      });

      setPixels(updatedGrid);
    } catch (error) {
      console.error("Ошибка при загрузке пикселей:", error);
    }
  };

  const savePixel = async (x, y, color) => {
    try {
      const pixelData = { x, y, color };
      await axios.post("http://localhost:3001/pixels", pixelData);
      console.log(`Пиксель (${x}, ${y}) успешно сохранен на сервере!`);
    } catch (error) {
      console.error("Ошибка при сохранении пикселя:", error);
    }
  };

  const handlePaint = (x, y) => {
    const now = new Date().getTime();
    const lastPaintTime = Cookies.get("lastPaintTime");

    if (lastPaintTime && now - lastPaintTime < 300000) {
      addNotification("Вы можете рисовать только раз в 5 минут!", "warning");
      return;
    }

    const updatedGrid = [...pixels];
    updatedGrid[x][y] = selectedColor;
    setPixels(updatedGrid);

    savePixel(x, y, selectedColor);
    Cookies.set("lastPaintTime", now, { expires: 7 });

    addNotification("Успешно закрашено!", "success");
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  const addChatMessage = (message) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const message = `${username || "Аноним"}: ${chatInput}`;
      
      // Сохраняем сообщение на сервере
      const messageData = { message, timestamp: new Date().toISOString() };
      await axios.post("http://localhost:3001/messages", messageData);

      addChatMessage(message);
      setChatInput("");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get("http://localhost:3001/messages");
      setChatMessages(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке сообщений:", error);
    }
  };

  const deleteOldMessages = async () => {
    try {
      const response = await axios.get("http://localhost:3001/messages");
      const now = new Date().getTime();

      // Удаляем сообщения старше 5 минут
      const messagesToDelete = response.data.filter((msg) => {
        const messageTime = new Date(msg.timestamp).getTime();
        return now - messageTime > 300000; // 5 минут
      });

      for (const msg of messagesToDelete) {
        await axios.delete(`http://localhost:3001/messages/${msg.id}`);
      }

      // Обновляем список сообщений после удаления старых
      fetchMessages();
    } catch (error) {
      console.error("Ошибка при удалении сообщений:", error);
    }
  };

  return (
    <div className="battle-container">
      <h1 className="title">Pixel Battle</h1>
      <div className="content">
        {/* Поле для рисования */}
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
                  {message.message}
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
