import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Bell, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within NotificationProvider");
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const addNotification = useCallback((notification) => {
        const id = Date.now();
        const newNotification = {
            id,
            title: notification.title || "Samvaad",
            message: notification.message,
            type: notification.type || "info", // "info", "success", "error", "message"
            icon: notification.icon,
            avatar: notification.avatar,
            onClick: notification.onClick,
            duration: notification.duration || 5000,
        };

        setNotifications(prev => [...prev, newNotification]);

        if (newNotification.duration !== Infinity) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-rose-400" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-400" />;
            default: return <Bell className="w-5 h-5 text-sv-accent" />;
        }
    };

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}

            {/* Notification Stack */}
            <div className="fixed top-4 md:top-6 right-0 md:right-6 left-0 md:left-auto flex flex-col items-center md:items-end gap-3 px-4 md:px-0 z-[9999] pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="pointer-events-auto w-full max-w-[380px]"
                        >
                            <div
                                onClick={() => {
                                    if (n.onClick) n.onClick();
                                    removeNotification(n.id);
                                }}
                                className={`
                  relative overflow-hidden group sv-glass p-1 rounded-2xl shadow-2xl border border-white/10
                  hover:scale-[1.02] active:scale-95 transition-all cursor-pointer
                `}
                            >
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-sv-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl">
                                    {/* Left Icon/Avatar */}
                                    <div className="flex-shrink-0">
                                        {n.avatar ? (
                                            <div className="relative">
                                                <img src={n.avatar} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10" />
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-sv-bg-2 flex items-center justify-center p-1">
                                                    {getIcon(n.type)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ring-2 ring-white/5">
                                                {n.icon || getIcon(n.type)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate leading-tight mb-0.5">
                                            {n.title}
                                        </h4>
                                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                    </div>

                                    {/* Close */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeNotification(n.id);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Progress bar for auto-dismiss */}
                                {n.duration !== Infinity && (
                                    <motion.div
                                        initial={{ width: "100%" }}
                                        animate={{ width: "0%" }}
                                        transition={{ duration: n.duration / 1000, ease: "linear" }}
                                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-sv-accent to-blue-400 opacity-50"
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
