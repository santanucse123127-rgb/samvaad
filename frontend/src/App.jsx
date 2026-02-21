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
import NotFound from "./pages/NotFound";

import { CustomToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { ClipboardProvider } from "./context/ClipboardContext";
import Index from "./pages/Index";


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
});

/* ── Full-screen loader ── */
const Loader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-5 sv-animated-bg">
    <div className="w-14 h-14 rounded-2xl sv-gradient flex items-center justify-center shadow-xl shadow-blue-500/30">
      <MessageSquare className="w-7 h-7 text-white" />
    </div>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
    <p className="text-sm font-medium tracking-wider" style={{ color: 'hsl(var(--sv-text-2))' }}>Starting Samvaad…</p>
  </div>
);

/* ── Routes with auth guards ── */
const AnimatedRoutes = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/chat" replace /> : <Register />} />
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
      <CustomToastProvider>
        <Toaster />
        <AppContent />
      </CustomToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
