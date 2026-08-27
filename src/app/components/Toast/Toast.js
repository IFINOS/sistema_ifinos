"use client";

// Hooks
import { useEffect } from "react";

// Components
import { toast } from "sonner";

// toast criado para renderizar via SSR :
const Toast = ({ message, type = "error" }) => {
  useEffect(() => {
    if (!message) return;

    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [message, type]);

  return null;
};

export default Toast;