// src/contexts/ToastContext.jsx
import React, { createContext, useContext } from "react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";


const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const CustomToastProvider = ({ children }) => {
  const showToast = ({ title, description, variant = "default" }) => {
    const toastId = Math.random().toString(36).substring(2, 9);
    const container = document.createElement("div");
    container.id = toastId;
    document.body.appendChild(container);

    const removeToast = () => {
      document.body.removeChild(container);
    };

    const toastElement = (
      <Toast variant={variant} onOpenChange={(open) => !open && removeToast()}>
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
        <ToastClose />
      </Toast>
    );

    const root = React.createElement(() => toastElement);
    return toastElement;
  };

  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
};
