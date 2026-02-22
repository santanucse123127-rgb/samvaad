import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { Smartphone, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { initQrSession } from '../services/deviceAPI';
import { useAuth } from '../context/AuthContext';

const QRLogin = () => {
    const [sessionId, setSessionId] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, qr, authorized, error
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const getNewSession = async () => {
        try {
            setStatus('loading');
            const res = await initQrSession();
            if (res.success) {
                setSessionId(res.data.sessionId);
                setStatus('qr');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    useEffect(() => {
        getNewSession();
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        // Connect to socket with sessionId for anonymous status tracking
        const newSocket = io(SOCKET_URL, {
            auth: { sessionId }
        });

        newSocket.on('connect', () => {
            console.log('Connected to QR session socket:', sessionId);
        });

        newSocket.on('qr-authorized', async (data) => {
            console.log('QR Authorized!', data);
            setStatus('authorized');

            // Artificial delay for smooth transition
            setTimeout(async () => {
                const success = await loginWithToken(data.token, data.user);
                if (success) {
                    navigate('/chat');
                }
            }, 1500);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [sessionId]);

    return (
        <div className="min-h-screen sv-animated-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[480px] bg-sv-surface/80 backdrop-blur-2xl border border-sv-border/50 rounded-[40px] shadow-2xl overflow-hidden p-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/login" className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white">Linked Devices</h1>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Secure Sign-in</p>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-8">
                    {status === 'loading' && (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 size={48} className="text-sv-accent animate-spin" />
                            <p className="text-sm font-medium text-white/40 italic">Generating secure session...</p>
                        </div>
                    )}

                    {status === 'qr' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full space-y-8"
                        >
                            <div className="relative p-6 bg-white rounded-[40px] shadow-2xl inline-block mx-auto border-8 border-sv-accent/10">
                                <QRCodeSVG
                                    value={JSON.stringify({ type: 'linking_session', sessionId })}
                                    size={220}
                                    level="H"
                                    includeMargin={false}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                    <ShieldCheck size={100} className="text-sv-accent" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Scan this QR Code</h3>
                                <div className="flex flex-col gap-3 items-center">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-8 h-8 rounded-xl bg-sv-accent/10 text-sv-accent flex items-center justify-center font-bold text-xs">1</div>
                                        <p className="text-xs text-white/60 text-left">Open <b>Samvaad</b> on your phone</p>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-8 h-8 rounded-xl bg-sv-accent/10 text-sv-accent flex items-center justify-center font-bold text-xs">2</div>
                                        <p className="text-xs text-white/60 text-left">Go to <b>Settings</b> &gt; <b>Linked Devices</b></p>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-8 h-8 rounded-xl bg-sv-accent/10 text-sv-accent flex items-center justify-center font-bold text-xs">3</div>
                                        <p className="text-xs text-white/60 text-left">Tap on <b>Link a Device</b> and point to this screen</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={getNewSession}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-sv-accent transition-colors mx-auto"
                            >
                                <RefreshCw size={12} /> Refresh QR Code
                            </button>
                        </motion.div>
                    )}

                    {status === 'authorized' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-12 flex flex-col items-center gap-6"
                        >
                            <div className="w-24 h-24 rounded-[40px] bg-sv-accent/10 text-sv-accent flex items-center justify-center">
                                <CheckCircle2 size={56} className="animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Identity Verified!</h2>
                                <p className="text-sm text-white/40 mt-1">Syncing your conversations...</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <div className="py-16 space-y-6">
                            <p className="text-sm text-sv-danger font-bold">Failed to initialize session.</p>
                            <button onClick={getNewSession} className="sv-btn-primary px-8">Try Again</button>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-3 opacity-40">
                    <ShieldCheck size={16} className="text-sv-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Secure Link</span>
                </div>
            </motion.div>
        </div>
    );
};

export default QRLogin;
