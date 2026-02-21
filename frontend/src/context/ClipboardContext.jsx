import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import socketService from '../services/socket';
import { clipboardAPI } from '../services/clipboardAPI';
import { toast } from '@/hooks/use-toast';

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                        */
/* ─────────────────────────────────────────────────────────────── */

/** Detect if a string looks like a URL */
const isURL = (str) => {
    try { new URL(str); return true; } catch { return false; }
};

/** Get platform name */
const getPlatform = () => {
    const ua = navigator.userAgent;
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac/.test(ua)) return 'macOS';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad/.test(ua)) return 'iOS';
    return 'Web';
};

const DEVICE_INFO = {
    name: `${getPlatform()} Browser`,
    platform: getPlatform(),
};

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 800; // debounce rapid clipboard changes

/* ─────────────────────────────────────────────────────────────── */
/*  Context                                                        */
/* ─────────────────────────────────────────────────────────────── */

const ClipboardContext = createContext(null);

export const useClipboard = () => {
    const ctx = useContext(ClipboardContext);
    if (!ctx) throw new Error('useClipboard must be used inside ClipboardProvider');
    return ctx;
};

export const ClipboardProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncEnabled, setSyncEnabled] = useState(
        () => localStorage.getItem('sv-clipboard-sync') !== 'false'
    );
    const [newItemAlert, setNewItemAlert] = useState(null); // { item, fromDevice }
    const debounceTimer = useRef(null);
    const lastContentRef = useRef('');

    /* ── Load history on mount ── */
    useEffect(() => {
        loadHistory();
    }, []);

    /* ── Socket: listen for incoming clipboard items from other sessions ── */
    useEffect(() => {
        const handleNewItem = (item) => {
            if (!syncEnabled) return;
            addToHistory(item);
            setNewItemAlert(item);
            // Auto-dismiss after 5s
            setTimeout(() => setNewItemAlert(null), 5000);

            // Show toast notification
            toast({
                title: '📋 Clipboard Synced',
                description: `${item.sourceDevice?.name || 'Another device'} copied: ${item.content?.slice(0, 60) || item.fileName || '(file)'
                    }`,
                duration: 4000,
            });
        };

        const handleItemDeleted = ({ id }) => {
            setHistory((prev) => prev.filter((i) => i._id !== id));
        };

        const handleCleared = () => {
            setHistory([]);
        };

        socketService.on('clipboard:new-item', handleNewItem);
        socketService.on('clipboard:item-deleted', handleItemDeleted);
        socketService.on('clipboard:cleared', handleCleared);

        return () => {
            socketService.off('clipboard:new-item', handleNewItem);
            socketService.off('clipboard:item-deleted', handleItemDeleted);
            socketService.off('clipboard:cleared', handleCleared);
        };
    }, [syncEnabled]);

    /* ── Browser clipboard watcher (passive monitor via focus events) ── */
    useEffect(() => {
        if (!syncEnabled) return;

        const handlePaste = async (e) => {
            // Only auto-capture if there's actual clipboard data different from last
            const text = e.clipboardData?.getData('text');
            if (text && text !== lastContentRef.current) {
                lastContentRef.current = text;
                // Don't auto-push on paste — user must explicitly share
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [syncEnabled]);

    /* ──────────────────── Core methods ──────────────────── */

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await clipboardAPI.getHistory();
            setHistory(res.data.data || []);
        } catch (err) {
            console.error('Failed to load clipboard history:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToHistory = useCallback((item) => {
        setHistory((prev) => {
            // Deduplicate by _id
            const exists = prev.some((i) => i._id === item._id);
            if (exists) return prev;
            const updated = [item, ...prev].slice(0, MAX_HISTORY);
            return updated;
        });
    }, []);

    /**
     * Push clipboard content to the server and broadcast to other devices.
     * This is the main "share" action a user triggers.
     */
    const pushClipboard = useCallback(
        async ({ content, fileData, fileName, fileSize, mimeType } = {}) => {
            if (!syncEnabled) return;
            if (!content && !fileData) return;

            // Debounce rapid calls
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            return new Promise((resolve) => {
                debounceTimer.current = setTimeout(async () => {
                    try {
                        const type = fileData
                            ? mimeType?.startsWith('image/')
                                ? 'image'
                                : 'file'
                            : isURL(content)
                                ? 'url'
                                : 'text';

                        const payload = {
                            type,
                            content: content || '',
                            fileData: fileData || null,
                            fileName: fileName || null,
                            fileSize: fileSize || null,
                            mimeType: mimeType || null,
                            sourceDevice: DEVICE_INFO,
                        };

                        const res = await clipboardAPI.push(payload);
                        const item = res.data.data;

                        // Add to local history immediately (optimistic)
                        addToHistory(item);

                        // Also emit via socket for ultra-low latency
                        socketService.emit('clipboard:push', item);

                        resolve(item);
                    } catch (err) {
                        console.error('Failed to push clipboard:', err);
                        toast({
                            title: 'Clipboard sync failed',
                            description: err.message,
                            variant: 'destructive',
                        });
                        resolve(null);
                    }
                }, DEBOUNCE_MS);
            });
        },
        [syncEnabled, addToHistory]
    );

    /**
     * Read current browser clipboard and push it.
     */
    const captureAndPush = useCallback(async () => {
        try {
            if (!navigator.clipboard?.readText) {
                toast({
                    title: 'Clipboard access denied',
                    description: 'Please grant clipboard permission in your browser.',
                    variant: 'destructive',
                });
                return;
            }
            const text = await navigator.clipboard.readText();
            if (!text) return;
            await pushClipboard({ content: text });
        } catch (err) {
            toast({
                title: 'Cannot read clipboard',
                description: 'Make sure clipboard access is allowed for this page.',
                variant: 'destructive',
            });
        }
    }, [pushClipboard]);

    /**
     * Copy a history item to the local clipboard.
     */
    const copyToLocalClipboard = useCallback(async (item) => {
        try {
            if (item.type === 'image' && item.fileData) {
                // For images, try writing as blob
                const blob = await fetch(item.fileData).then((r) => r.blob());
                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob }),
                ]);
            } else {
                await navigator.clipboard.writeText(item.content || '');
            }
            toast({ title: '✅ Copied to clipboard!', duration: 2000 });
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = item.content || '';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            toast({ title: '✅ Copied!', duration: 2000 });
        }
    }, []);

    const deleteItem = useCallback(async (id) => {
        try {
            await clipboardAPI.deleteItem(id);
            setHistory((prev) => prev.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Failed to delete clipboard item:', err);
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            await clipboardAPI.clearAll();
            setHistory([]);
        } catch (err) {
            console.error('Failed to clear clipboard history:', err);
        }
    }, []);

    const toggleSync = useCallback((enabled) => {
        const val = enabled ?? !syncEnabled;
        setSyncEnabled(val);
        localStorage.setItem('sv-clipboard-sync', val ? 'true' : 'false');
        toast({
            title: val ? '📋 Clipboard sync enabled' : '🔒 Clipboard sync disabled',
            duration: 2000,
        });
    }, [syncEnabled]);

    const value = React.useMemo(
        () => ({
            history,
            loading,
            syncEnabled,
            newItemAlert,
            setNewItemAlert,
            loadHistory,
            pushClipboard,
            captureAndPush,
            copyToLocalClipboard,
            deleteItem,
            clearHistory,
            toggleSync,
        }),
        [
            history, loading, syncEnabled, newItemAlert,
            loadHistory, pushClipboard, captureAndPush,
            copyToLocalClipboard, deleteItem, clearHistory, toggleSync,
        ]
    );

    return (
        <ClipboardContext.Provider value={value}>
            {children}
        </ClipboardContext.Provider>
    );
};
