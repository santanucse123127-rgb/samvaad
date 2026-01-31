import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import NoiseOverlay from "@/components/NoiseOverlay";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { CustomToastProvider } from "./context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const { user,token } = useAuth();
  console.log("User : ",user)
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            user ? (
              <ChatProvider token={token} userId={user?._id}>
                <Chat token={token}/>
              </ChatProvider>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const [isDark, setIsDark] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <>
      <CustomCursor />
      <NoiseOverlay />
      
      {/* <Navbar isDark={isDark} toggleTheme={toggleTheme} /> */}
      <AnimatedRoutes />
    </>
  );
};

const App = () => (
  // <QueryClientProvider client={queryClient}>
  //   <TooltipProvider>
  //     <Toaster />
  //     <Sonner />
  //     <BrowserRouter>
  //       <AppContent />
  //     </BrowserRouter>
  //   </TooltipProvider>
  // </QueryClientProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomToastProvider>
        <AuthProvider>
          <Toaster />
            <AppContent />
        </AuthProvider>
      </CustomToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
