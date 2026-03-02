import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
    Volume2, VolumeX, User, PhoneCall, Minimize2, Maximize2, FlipHorizontal,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import socketService from '../../services/socket';

/* ─── ICE servers ─── */
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
};

/* ─── Timer ─── */
const useTimer = (running) => {
    const [secs, setSecs] = useState(0);
    useEffect(() => {
        if (!running) { setSecs(0); return; }
        const id = setInterval(() => setSecs(s => s + 1), 1000);
        return () => clearInterval(id);
    }, [running]);
    return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
};

/* ─── Mini avatar ─── */
const MiniAvatar = ({ src, name, size = 40 }) => (
    <div
        style={{
            width: size, height: size, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 700,
            background: 'linear-gradient(135deg,hsl(var(--sv-accent)/0.3),hsl(var(--sv-accent-2)/0.2))',
            color: 'hsl(var(--sv-accent))', fontSize: size * 0.38,
        }}
    >
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <User size={size * 0.45} />}
    </div>
);

/* ─── Pulsing avatar for incoming screen ─── */
const PulsingAvatar = ({ src, name, size = 72 }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {[1.4, 1.7, 2].map((s, i) => (
            <motion.div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '2px solid hsl(var(--sv-accent)/0.3)',
            }}
                animate={{ scale: [1, s], opacity: [0.6, 0] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
            />
        ))}
        <MiniAvatar src={src} name={name} size={size} />
    </div>
);

/* ─── Round icon button ─── */
const RoundBtn = ({ icon: Icon, label, active, danger, onClick, size = 36 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
            onClick={onClick}
            style={{
                width: size, height: size, borderRadius: '50%', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                background: danger ? 'hsl(var(--sv-danger))'
                    : active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.13)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Icon size={size * 0.45} />
        </motion.button>
        {label && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>{label}</span>}
    </div>
);

/* ═══════════════════════════════════════════════════════════ */
const CallInterface = () => {
    const { activeCall, setActiveCall, incomingCall, setIncomingCall } = useChat();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState('idle');
    const [minimized, setMinimized] = useState(false);
    const [isFrontCamera, setIsFrontCamera] = useState(true);

    /* ── refs — zero stale-closure risk ── */
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);   // ← KEY: store stream before UI is ready
    const remoteAudioRef = useRef(null);   // hidden <audio>
    const remoteVideoRef = useRef(null);   // remote <video> (video calls)
    const localVideoRef = useRef(null);   // local PiP
    const ringingRef = useRef(null);
    const callStatusRef = useRef('idle');
    const pendingIce = useRef([]);

    const isConnected = callStatus === 'connected';
    const isVideo = activeCall?.type === 'video' || incomingCall?.callType === 'video';
    const duration = useTimer(isConnected);

    /* keep status ref in sync */
    useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);

    /* ── CRITICAL: attach remote stream whenever it arrives OR audio el mounts ──
       This runs after every render, so it catches both:
         a) remoteStreamRef set before <audio> mounts
         b) <audio> mounting after remoteStreamRef is set
    ── */
    useEffect(() => {
        const stream = remoteStreamRef.current;
        if (!stream) return;
        if (!isVideo && remoteAudioRef.current && remoteAudioRef.current.srcObject !== stream) {
            console.log('🔊 Attaching remote stream to <audio>');
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.volume = 1;
            remoteAudioRef.current.play().catch(e => console.warn('audio.play():', e));
        }
        if (isVideo && remoteVideoRef.current && remoteVideoRef.current.srcObject !== stream) {
            remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.play().catch(() => { });
        }
    });   /* ← intentionally no deps array: runs every render */

    /* ── Ringing sound ── */
    useEffect(() => {
        if (incomingCall && !activeCall) {
            let alive = true;
            let ctx = null;
            (async () => {
                try {
                    ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const ring = () => {
                        if (!alive) return;
                        [[480, 0, 0.35], [620, 0, 0.35], [480, 0.45, 0.35], [620, 0.45, 0.35]].forEach(([f, s, d]) => {
                            const o = ctx.createOscillator(), g = ctx.createGain();
                            o.connect(g); g.connect(ctx.destination);
                            o.type = 'sine'; o.frequency.value = f;
                            g.gain.setValueAtTime(0, ctx.currentTime + s);
                            g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + s + 0.04);
                            g.gain.setValueAtTime(0.1, ctx.currentTime + s + d - 0.04);
                            g.gain.linearRampToValueAtTime(0, ctx.currentTime + s + d);
                            o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d);
                        });
                        setTimeout(ring, 2200);
                    };
                    ring();
                } catch (_) { }
            })();
            ringingRef.current = { stop: () => { alive = false; ctx?.close().catch(() => { }); } };
        } else {
            ringingRef.current?.stop(); ringingRef.current = null;
        }
        return () => { ringingRef.current?.stop(); ringingRef.current = null; };
    }, [!!incomingCall, !!activeCall]); // eslint-disable-line

    /* ── cleanup ── */
    const cleanup = useCallback(() => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
        ringingRef.current?.stop(); ringingRef.current = null;
        pendingIce.current = [];
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        setCallStatus('idle'); setIsMuted(false); setIsVideoOff(false); setMinimized(false);
        setActiveCall(null); setIncomingCall(null);
    }, [setActiveCall, setIncomingCall]);

    /* ── get user media ── */
    const getMedia = useCallback(async (withVideo = false, useFrontCamera = true) => {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        try {
            return await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                video: withVideo
                    ? (isMobile
                        ? { facingMode: useFrontCamera ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                        : { width: 1280, height: 720 })
                    : false,
            });
        } catch (e) {
            console.error('getUserMedia error:', e.name, e.message);
            return null;
        }
    }, []);

    /* ── drain buffered ICE candidates ── */
    const drainIce = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc?.remoteDescription?.type) return;
        while (pendingIce.current.length) {
            try { await pc.addIceCandidate(new RTCIceCandidate(pendingIce.current.shift())); }
            catch (e) { console.warn('ICE drain err:', e.message); }
        }
    }, []);

    /* ── build PeerConnection ── */
    const makePeer = useCallback((targetId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) socketService.emit('ice-candidate', { to: targetId, candidate });
        };

        /* ── ontrack: store in ref immediately, UI effect will attach ── */
        pc.ontrack = ({ streams, track }) => {
            console.log('🎙️ ontrack:', track.kind, 'streams:', streams.length);
            const stream = streams[0];
            if (!stream) return;
            remoteStreamRef.current = stream;
            /* Force a re-render so the useEffect above runs and attaches the stream */
            setCallStatus(s => s === 'connected' ? 'connected' : s);
        };

        pc.onconnectionstatechange = () => {
            console.log('🔗 connection:', pc.connectionState);
            if (pc.connectionState === 'connected') setCallStatus('connected');
            if (['disconnected', 'failed'].includes(pc.connectionState)) {
                if (callStatusRef.current !== 'idle') cleanup();
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('🧊 ICE:', pc.iceConnectionState);
            if (['connected', 'completed'].includes(pc.iceConnectionState)) setCallStatus('connected');
        };

        pcRef.current = pc;
        return pc;
    }, [cleanup]);

    /* ══ OUTGOING CALL ══ */
    useEffect(() => {
        if (!activeCall || incomingCall || callStatus !== 'idle') return;
        const targetId = activeCall.otherUser?._id;
        if (!targetId) return;
        let alive = true;
        setCallStatus('ringing');
        (async () => {
            const stream = await getMedia(activeCall.type === 'video');
            if (!stream || !alive) { if (!stream) { alert('Microphone access denied.'); cleanup(); } return; }
            localStreamRef.current = stream;
            if (localVideoRef.current && activeCall.type === 'video') {
                localVideoRef.current.srcObject = stream; localVideoRef.current.play().catch(() => { });
            }
            const pc = makePeer(targetId);
            stream.getTracks().forEach(t => pc.addTrack(t, stream));
            const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: activeCall.type === 'video' });
            await pc.setLocalDescription(offer);
            socketService.emit('call-user', { to: targetId, offer: pc.localDescription, callType: activeCall.type });
        })();
        return () => { alive = false; };
        // eslint-disable-next-line
    }, [activeCall?.otherUser?._id, activeCall?.type]);

    /* ══ SOCKET LISTENERS ══ */
    useEffect(() => {
        const onAnswered = async ({ answer }) => {
            console.log('📞 call-answered');
            const pc = pcRef.current;
            if (!pc || pc.signalingState !== 'have-local-offer') return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await drainIce();
                setTimeout(() => {
                    if (['ringing', 'connecting'].includes(callStatusRef.current)) setCallStatus('connected');
                }, 2500);
            } catch (e) { console.error('setRemoteDescription(answer):', e); }
        };

        const onIce = async ({ candidate }) => {
            if (!candidate || !pcRef.current) return;
            if (pcRef.current.remoteDescription?.type) {
                try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
                catch (e) { console.warn('addIceCandidate:', e.message); }
            } else {
                pendingIce.current.push(candidate);
            }
        };

        const onRejected = () => { console.log('📞 rejected'); cleanup(); };
        const onEnded = () => { console.log('📞 ended'); cleanup(); };
        const onTimeout = () => { console.log('📞 call timed out'); cleanup(); };
        const onCancelled = () => { console.log('📞 call cancelled by caller'); cleanup(); };

        socketService.on('call-answered', onAnswered);
        socketService.on('ice-candidate', onIce);
        socketService.on('call-rejected', onRejected);
        socketService.on('call-ended', onEnded);
        socketService.on('call-timeout', onTimeout);
        socketService.on('call-cancelled', onCancelled);
        return () => {
            socketService.off('call-answered', onAnswered);
            socketService.off('ice-candidate', onIce);
            socketService.off('call-rejected', onRejected);
            socketService.off('call-ended', onEnded);
            socketService.off('call-timeout', onTimeout);
            socketService.off('call-cancelled', onCancelled);
        };
    }, [cleanup, drainIce]);

    /* ══ ANSWER ══ */
    const answerCall = useCallback(async () => {
        if (!incomingCall) return;
        ringingRef.current?.stop(); ringingRef.current = null;
        const callType = incomingCall.callType || 'voice';
        setCallStatus('connecting');

        const stream = await getMedia(callType === 'video');
        if (!stream) { alert('Microphone access denied.'); rejectCall(); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current && callType === 'video') {
            localVideoRef.current.srcObject = stream; localVideoRef.current.play().catch(() => { });
        }

        const pc = makePeer(incomingCall.from);
        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        await drainIce();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketService.emit('answer-call', { to: incomingCall.from, answer: pc.localDescription });

        /* Switch UI — set activeCall FIRST so audio element mounts */
        setActiveCall({ otherUser: incomingCall.fromUser, type: callType });
        setIncomingCall(null);

        setTimeout(() => {
            if (callStatusRef.current === 'connecting') setCallStatus('connected');
        }, 4000);
    }, [incomingCall, getMedia, makePeer, drainIce, setActiveCall, setIncomingCall]); // eslint-disable-line

    const rejectCall = useCallback(() => {
        if (incomingCall?.from) socketService.emit('reject-call', { to: incomingCall.from });
        cleanup();
    }, [incomingCall, cleanup]);

    const endCall = useCallback(() => {
        const to = activeCall?.otherUser?._id || incomingCall?.from;
        if (to) socketService.emit('end-call', { to });
        cleanup();
    }, [activeCall, incomingCall, cleanup]);

    const toggleMute = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
        setIsMuted(p => !p);
    };
    const toggleVideo = () => {
        localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
        setIsVideoOff(p => !p);
    };
    const switchCamera = useCallback(async () => {
        if (!isVideo || !localStreamRef.current) return;
        const newFacing = !isFrontCamera;
        // Stop current video tracks
        localStreamRef.current.getVideoTracks().forEach(t => t.stop());
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: newFacing ? 'user' : 'environment' },
                audio: false,
            });
            const newVideoTrack = newStream.getVideoTracks()[0];
            if (newVideoTrack) {
                // Replace track in peer connection
                const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
                if (sender) await sender.replaceTrack(newVideoTrack);
                // Update local stream
                const updatedStream = new MediaStream([
                    ...localStreamRef.current.getAudioTracks(),
                    newVideoTrack,
                ]);
                localStreamRef.current = updatedStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = updatedStream;
                }
                setIsFrontCamera(newFacing);
            }
        } catch (e) {
            console.error('switchCamera error:', e);
        }
    }, [isVideo, isFrontCamera]);

    /* ══════════════════════════════════════════════════════════
       ALWAYS render the hidden audio element so the ref is
       available the moment ontrack fires — even during incoming
       call state or before activeCall is set.
    ══════════════════════════════════════════════════════════ */
    if (!incomingCall && !activeCall) return null;

    /* ════════════
       INCOMING CALL — compact notification card
    ════════════ */
    if (incomingCall && !activeCall) {
        const caller = incomingCall.fromUser;
        const isVid = incomingCall.callType === 'video';
        return (
            <>
                {/* Always-mounted hidden audio */}
                <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

                <AnimatePresence>
                    <motion.div
                        key="incoming-toast"
                        style={{
                            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                            width: 320, borderRadius: 20,
                            background: 'hsl(var(--sv-surface))',
                            border: '1px solid hsl(var(--sv-border))',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
                            overflow: 'hidden',
                        }}
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    >
                        {/* Accent top bar */}
                        <div style={{ height: 3, background: 'linear-gradient(90deg,hsl(var(--sv-accent)),hsl(var(--sv-accent-2)))' }} />

                        <div style={{ padding: '18px 20px' }}>
                            {/* Label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                                <div className="sv-tag" style={{ fontSize: 11 }}>
                                    {isVid ? <Video size={11} /> : <PhoneCall size={11} />}
                                    Incoming {isVid ? 'Video' : 'Voice'} Call
                                </div>
                                {/* Animated dot */}
                                <motion.div
                                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--sv-online))', marginLeft: 'auto' }}
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                />
                            </div>

                            {/* Caller info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                                <PulsingAvatar src={caller?.avatar} name={caller?.name} size={52} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: 'hsl(var(--sv-text))' }}>
                                        {caller?.name || 'Unknown'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'hsl(var(--sv-text-3))', marginTop: 2 }}>
                                        Calling you…
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                                    onClick={rejectCall}
                                    style={{
                                        flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: 'hsl(var(--sv-danger)/0.15)', color: 'hsl(var(--sv-danger))',
                                        fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    }}
                                >
                                    <PhoneOff size={14} /> Decline
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                                    onClick={answerCall}
                                    style={{
                                        flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: 'hsl(var(--sv-online))', color: '#fff',
                                        fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    }}
                                >
                                    {isVid ? <Video size={14} /> : <Phone size={14} />} Accept
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </>
        );
    }

    /* ════════════
       ACTIVE CALL — floating toast (compact)
    ════════════ */
    const other = activeCall?.otherUser;

    return (
        <>
            {/* ── ALWAYS-MOUNTED audio/video for remote stream ── */}
            <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
            {isVideo && (
                <video ref={remoteVideoRef} autoPlay playsInline
                    style={{ display: 'none', position: 'fixed', width: 1, height: 1, opacity: 0 }} />
            )}

            <AnimatePresence>
                <motion.div
                    key="call-toast"
                    drag
                    dragMomentum={false}
                    style={{
                        position: 'fixed',
                        bottom: 24, right: 24,
                        zIndex: 9999,
                        width: minimized ? 220 : 300,
                        borderRadius: 20,
                        overflow: 'hidden',
                        background: minimized
                            ? 'hsl(222 55% 11%)'
                            : 'linear-gradient(145deg, hsl(222 60% 10%), hsl(224 50% 8%))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
                        cursor: 'grab',
                        userSelect: 'none',
                    }}
                    initial={{ opacity: 0, y: 40, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                >
                    {/* Accent strip */}
                    <div style={{
                        height: 2,
                        background: isConnected
                            ? 'linear-gradient(90deg,hsl(var(--sv-online)),hsl(var(--sv-accent)))'
                            : 'linear-gradient(90deg,hsl(var(--sv-accent)),hsl(var(--sv-accent-2)))',
                    }} />

                    {/* ── Minimized pill layout ── */}
                    {minimized ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                            {/* Pulsing avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <MiniAvatar src={other?.avatar} name={other?.name} size={34} />
                                {isConnected && (
                                    <motion.div
                                        style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: 'hsl(var(--sv-online))', border: '2px solid hsl(222 55% 11%)' }}
                                        animate={{ opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {other?.name}
                                </div>
                                <div style={{ fontSize: 11, color: isConnected ? 'hsl(var(--sv-online))' : 'rgba(255,255,255,0.45)' }}>
                                    {isConnected ? duration : (callStatus === 'ringing' ? 'Ringing…' : 'Connecting…')}
                                </div>
                            </div>

                            {/* Quick controls */}
                            <RoundBtn icon={isMuted ? MicOff : Mic} active={isMuted} onClick={toggleMute} size={30} />
                            <RoundBtn icon={PhoneOff} danger onClick={endCall} size={30} />
                            <RoundBtn icon={Maximize2} onClick={() => setMinimized(false)} size={30} />
                        </div>
                    ) : (
                        /* ── Full toast layout ── */
                        <div style={{ padding: '16px 18px 18px' }}>

                            {/* Top row: avatar + info + minimize */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                {/* Avatar with live dot */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <MiniAvatar src={other?.avatar} name={other?.name} size={44} />
                                    <motion.div
                                        style={{
                                            position: 'absolute', bottom: 1, right: 1,
                                            width: 11, height: 11, borderRadius: '50%',
                                            background: isConnected ? 'hsl(var(--sv-online))' : 'hsl(var(--sv-accent))',
                                            border: '2px solid hsl(222 60% 10%)',
                                        }}
                                        animate={{ opacity: isConnected ? [1, 0.5, 1] : [1, 0.3, 1], scale: isConnected ? [1, 1.15, 1] : 1 }}
                                        transition={{ duration: 1.6, repeat: Infinity }}
                                    />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {other?.name || 'Unknown'}
                                    </div>
                                    <div style={{ fontSize: 12, marginTop: 2 }}>
                                        {isConnected ? (
                                            <span style={{ color: 'hsl(var(--sv-online))', fontFamily: 'monospace', fontWeight: 600 }}>
                                                ● {duration}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                {callStatus === 'ringing' ? 'Ringing…' : 'Connecting…'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Minimize */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => setMinimized(true)}
                                    style={{
                                        width: 26, height: 26, borderRadius: '50%', border: 'none',
                                        background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}
                                >
                                    <Minimize2 size={13} />
                                </motion.button>
                            </div>

                            {/* VIDEO PiP — local camera preview (video calls only) */}
                            {isVideo && localStreamRef.current && (
                                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 14, position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                    <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {isVideoOff && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--sv-surface))' }}>
                                            <VideoOff size={22} style={{ color: 'hsl(var(--sv-text-3))' }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Wave animation when connected (voice) */}
                            {isConnected && !isVideo && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: 24, marginBottom: 14 }}>
                                    {[0.4, 0.65, 1, 0.75, 0.5, 0.85, 0.55].map((h, i) => (
                                        <motion.div key={i}
                                            style={{ width: 3, borderRadius: 3, background: 'hsl(var(--sv-online))', transformOrigin: 'bottom' }}
                                            animate={{ scaleY: [h, h * 0.25, h] }}
                                            transition={{ duration: 0.85, delay: i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                                            initial={{ scaleY: h, height: 24 }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                <RoundBtn icon={isMuted ? MicOff : Mic} label={isMuted ? 'Unmute' : 'Mute'} active={isMuted} onClick={toggleMute} size={40} />
                                <RoundBtn icon={Volume2} label="Speaker" onClick={() => { }} size={40} />
                                <RoundBtn icon={PhoneOff} label="End" danger onClick={endCall} size={44} />
                                {isVideo && <RoundBtn icon={isVideoOff ? VideoOff : Video} label={isVideoOff ? 'Start' : 'Stop'} active={isVideoOff} onClick={toggleVideo} size={40} />}
                                {isVideo && /Mobi|Android/i.test(navigator.userAgent) && (
                                    <RoundBtn icon={FlipHorizontal} label="Flip" onClick={switchCamera} size={40} />
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default CallInterface;
