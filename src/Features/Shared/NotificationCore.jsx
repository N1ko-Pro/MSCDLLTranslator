import React, { useState, useEffect, useRef } from 'react';
import NotifPopup from './NotifPopup/NotifPopup';

export default function NotificationCore() {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  const removeNotification = (id) => {
    timersRef.current.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const handleNotify = (e) => {
      const { id, type, title, message, duration } = e.detail;
      setNotifications((prev) => [...prev, { id, type, title, message }]);

      if (duration) {
        const timerId = setTimeout(() => {
          removeNotification(id);
        }, duration);
        timersRef.current.set(id, timerId);
      }
    };

    window.addEventListener('app-notification', handleNotify);
    const timers = timersRef.current;
    return () => {
      window.removeEventListener('app-notification', handleNotify);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <div className="fixed top-28 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {notifications.map((n) => (
        <NotifPopup key={n.id} notification={n} onRemove={removeNotification} />
      ))}
    </div>
  );
}
