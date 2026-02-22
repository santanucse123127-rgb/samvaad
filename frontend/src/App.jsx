import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import QRLogin from "./pages/QRLogin";
import NotFound from "./pages/NotFound";

import { CustomToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { ClipboardProvider } from "./context/ClipboardContext";
import { VibeProvider } from "./context/VibeContext";
import Index from "./pages/Index";
import { usePushNotifications } from "./hooks/usePushNotifications";


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
});

import LoadingScreen from "./components/LoadingScreen";
import LockScreen from "./components/LockScreen";

/* ── Routes with auth guards ── */
const AnimatedRoutes = () => {
  const { user, token, loading, isLocked, unlockApp } = useAuth();
  const location = useLocation();

  // Handle push notifications
  usePushNotifications(token);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/chat" replace /> : <Register />} />
          <Route path="/qr-login" element={user ? <Navigate to="/chat" replace /> : <QRLogin />} />
          <Route path="/chat"
            element={
              user ? (
                <ChatProvider token={token} userId={user._id}>
                  <ClipboardProvider>
                    <Chat token={token} />
                  </ClipboardProvider>
                </ChatProvider>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {isLocked && <LockScreen onVerify={unlockApp} token={token} />}
    </>
  );
};

/* ── App shell ── */
const AppContent = () => {
  useEffect(() => {
    // Ensure dark class is always applied for our design system
    document.documentElement.classList.add("dark");
  }, []);

  return <AnimatedRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VibeProvider>
        <CustomToastProvider>
          <Toaster />
          <AppContent />
        </CustomToastProvider>
      </VibeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
