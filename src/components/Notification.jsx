"use client"

import { useEffect, useState } from "react"

const Notification = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`notification ${type}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <div className="notification-icon">
        <i
          className={`fas ${
            type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"
          }`}
        ></i>
      </div>
      <div className="notification-content">{message}</div>
      <button
        className="notification-close"
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}

export default Notification

