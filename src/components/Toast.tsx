"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ message, show, onHide, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!show) return null;

  return (
    <div className="toast-container">
      <div className="toast">{message}</div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ show: false, message: "" });

  function showToast(message: string) {
    setToast({ show: true, message });
  }

  function hideToast() {
    setToast({ show: false, message: "" });
  }

  return { toast, showToast, hideToast };
}
