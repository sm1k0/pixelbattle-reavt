import React, { useEffect } from "react";
import "./CustomNotification.css";

function CustomNotification({ message, type, onClose }) {
  useEffect(() => {
    // Автоматическое закрытие уведомления через 3 секунды
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`custom-notification ${type}`}>
      {message}
    </div>
  );
}

export default CustomNotification;
