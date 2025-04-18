"use client"

import { createContext, useContext, useState } from "react"
import Notification from "../components/Notification"
const NotificationContext = createContext()
export const useNotification = () => useContext(NotificationContext)
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const showNotification = (message, type = "info", duration = 3000) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type, duration }])
  }
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

