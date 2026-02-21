import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clipboard, ClipboardCheck, ClipboardX, Copy, Trash2, X,
    Upload, Link2, FileText, Image as ImageIcon, Search,
    ToggleLeft, ToggleRight, RefreshCw, Monitor,
    Smartphone, Globe, Zap, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useClipboard } from '../../context/ClipboardContext';

/* ─── Helpers ─── */
const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
const fmtDate = (d) => {
    if (!d) return '';
    const now = new Date(); const date = new Date(d);
    const diff = Math.floor((now - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TYPE_ICON = {
    text: FileText,
    url: Link2,
    image: ImageIcon,
    file: FileText,
    'rich-text': FileText,
};

const PLATFORM_ICON = {
    Windows: Monitor,
    macOS: Monitor,
    Android: Smartphone,
    iOS: Smartphone,
    Web: Globe,
};

const TYPE_COLOR = {
    text: 'hsl(var(--sv-accent))',
    url: '#38bdf8',
    image: '#f472b6',
    file: '#a78bfa',
    'rich-text': '#34d399',
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Inline Confirm Modal (replaces window.confirm)                */
/* ═══════════════════════════════════════════════════════════════ */
const ConfirmModal = ({ title, message, onConfirm, onCancel, danger = false }) => (
    <AnimatePresence>
        <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
        >
            <motion.div
                className="w-full max-w-xs rounded-2xl p-5 shadow-2xl"
                style={{
                    background: 'hsl(var(--sv-surface-3))',
                    border: '1px solid hsl(var(--sv-border))',
                }}
                initial={{ scale: 0.88, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 16 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                        background: danger ? 'hsl(var(--sv-danger) / 0.12)' : 'hsl(var(--sv-accent) / 0.12)',
                    }}
                >
                    {danger
                        ? <ClipboardX size={18} style={{ color: 'hsl(var(--sv-danger))' }} />
                        : <Clipboard size={18} style={{ color: 'hsl(var(--sv-accent))' }} />
                    }
                </div>

                <p className="font-semibold text-sm mb-1" style={{ color: 'hsl(var(--sv-text))' }}>
                    {title}
                </p>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'hsl(var(--sv-text-3))' }}>
                    {message}
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                        style={{
                            background: 'hsl(var(--sv-surface-2))',
                            color: 'hsl(var(--sv-text-2))',
                            border: '1px solid hsl(var(--sv-border))',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                        style={{
                            background: danger ? 'hsl(var(--sv-danger))' : 'hsl(var(--sv-accent))',
                            color: 'white',
                        }}
                    >
                        {danger ? 'Clear All' : 'Confirm'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

/* ═══════════════════════════════════════════════════════════════ */
/*  File Size Error Banner (replaces alert())                     */
/* ═══════════════════════════════════════════════════════════════ */
const ErrorBanner = ({ message, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{
            background: 'hsl(var(--sv-danger) / 0.12)',
            border: '1px solid hsl(var(--sv-danger) / 0.3)',
        }}
    >
        <AlertTriangle size={13} style={{ color: 'hsl(var(--sv-danger))', flexShrink: 0 }} />
        <p className="flex-1 text-xs" style={{ color: 'hsl(var(--sv-danger))' }}>
            {message}
        </p>
        <button
            onClick={onDismiss}
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ color: 'hsl(var(--sv-danger))' }}
        >
            <X size={11} />
        </button>
    </motion.div>
);

/* ═══════════════════════════════════════════════════════════════ */
/*  Single history item (with expand / full-text toggle)         */
/* ═══════════════════════════════════════════════════════════════ */
const HistoryItem = ({ item, onCopy, onDelete }) => {
    const Icon = TYPE_ICON[item.type] || FileText;
    const PIcon = PLATFORM_ICON[item.sourceDevice?.platform] || Globe;
    const color = TYPE_COLOR[item.type] || 'hsl(var(--sv-accent))';
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const content = item.content || item.fileName || '(binary file)';
    // Show "expand" toggle only for longer text
    const isLong = content.length > 120;

    const handleCopy = () => {
        onCopy(item);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="group relative rounded-xl p-3 mb-2"
            style={{
                background: 'hsl(var(--sv-surface-2))',
                border: '1px solid hsl(var(--sv-border) / 0.5)',
            }}
        >
            <div className="flex items-start gap-2.5">
                {/* Type icon */}
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}18` }}
                >
                    <Icon size={14} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0 pr-14">
                    {/* Preview — image or text */}
                    {item.type === 'image' && item.fileData ? (
                        <img
                            src={item.fileData}
                            alt="clipboard"
                            className="w-full max-h-32 object-cover rounded-lg mb-1.5"
                        />
                    ) : (
                        <>
                            <p
                                className="text-xs leading-relaxed break-all whitespace-pre-wrap"
                                style={{
                                    color: 'hsl(var(--sv-text-2))',
                                    // when collapsed clip to 5 lines
                                    display: '-webkit-box',
                                    WebkitLineClamp: expanded ? 'unset' : 5,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: expanded ? 'visible' : 'hidden',
                                }}
                            >
                                {content}
                            </p>
                            {/* Expand / collapse toggle for long text */}
                            {isLong && (
                                <button
                                    onClick={() => setExpanded(p => !p)}
                                    className="flex items-center gap-0.5 mt-1 text-[10px] font-medium transition-colors"
                                    style={{ color: 'hsl(var(--sv-accent))' }}
                                >
                                    {expanded
                                        ? <><ChevronUp size={11} /> Show less</>
                                        : <><ChevronDown size={11} /> Show full text</>
                                    }
                                </button>
                            )}
                        </>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ background: `${color}20`, color }}
                        >
                            {item.type}
                        </span>
                        <span
                            className="text-[10px] flex items-center gap-1"
                            style={{ color: 'hsl(var(--sv-text-3))' }}
                        >
                            <PIcon size={9} />
                            {item.sourceDevice?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] ml-auto" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            {fmtDate(item.createdAt)} {fmtTime(item.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action buttons — always visible (top-right) */}
            <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                        background: copied ? '#22c55e20' : 'hsl(var(--sv-surface-3))',
                        color: copied ? '#22c55e' : 'hsl(var(--sv-text-2))',
                        border: '1px solid hsl(var(--sv-border) / 0.5)',
                    }}
                >
                    {copied ? <ClipboardCheck size={12} /> : <Copy size={12} />}
                </button>
                <button
                    onClick={() => onDelete(item._id)}
                    title="Delete"
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                        background: 'hsl(var(--sv-surface-3))',
                        color: 'hsl(var(--sv-danger))',
                        border: '1px solid hsl(var(--sv-border) / 0.5)',
                    }}
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </motion.div>
    );
};

/* ─── Drop zone ─── */
const DropZone = ({ onFileDrop }) => {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const processFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) =>
            onFileDrop({
                file,
                fileData: e.target.result,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
            });
        reader.readAsDataURL(file);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault(); setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 py-4 cursor-pointer transition-all"
            style={{
                borderColor: dragging ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-border))',
                background: dragging ? 'hsl(var(--sv-accent) / 0.06)' : 'transparent',
            }}
        >
            <Upload size={18} style={{ color: dragging ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-text-3))' }} />
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>
                Drop a file or <span style={{ color: 'hsl(var(--sv-accent))' }}>browse</span>
            </p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--sv-text-3))' }}>
                Images, PDFs, docs · max 1 MB
            </p>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════ */
/*  Main ClipboardSync panel                                      */
/* ═══════════════════════════════════════════════════════════════ */
const ClipboardSync = ({ onClose }) => {
    const {
        history, loading, syncEnabled, newItemAlert, setNewItemAlert,
        captureAndPush, pushClipboard, copyToLocalClipboard, deleteItem,
        clearHistory, toggleSync, loadHistory,
    } = useClipboard();

    const [search, setSearch] = useState('');
    const [manualText, setManualText] = useState('');
    const [pushing, setPushing] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [fileError, setFileError] = useState(null);

    const filtered = history.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            item.content?.toLowerCase().includes(q) ||
            item.fileName?.toLowerCase().includes(q) ||
            item.type?.toLowerCase().includes(q) ||
            item.sourceDevice?.name?.toLowerCase().includes(q)
        );
    });

    const handlePushText = async () => {
        if (!manualText.trim()) return;
        setPushing(true);
        await pushClipboard({ content: manualText.trim() });
        setManualText('');
        setPushing(false);
    };

    const handleFileDrop = async ({ file, fileData, fileName, fileSize, mimeType }) => {
        if (fileSize > 1024 * 1024) {
            setFileError(`"${fileName}" is too large (${(fileSize / 1024 / 1024).toFixed(1)} MB). Maximum size is 1 MB.`);
            return;
        }
        setFileError(null);
        setPushing(true);
        await pushClipboard({ content: fileName, fileData, fileName, fileSize, mimeType });
        setPushing(false);
    };

    const handleConfirmClear = async () => {
        await clearHistory();
        setShowClearModal(false);
    };

    return (
        <>
            {/* ── Confirm clear modal (portal-style, over everything) ── */}
            {showClearModal && (
                <ConfirmModal
                    title="Clear clipboard history?"
                    message="This will permanently delete all clipboard items across all your devices. This cannot be undone."
                    danger
                    onConfirm={handleConfirmClear}
                    onCancel={() => setShowClearModal(false)}
                />
            )}

            <motion.div
                className="flex flex-col h-full"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
                {/* ── Header (fixed) ── */}
                <div
                    className="flex items-center gap-3 px-4 py-3.5 border-b flex-shrink-0"
                    style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}
                >
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'hsl(var(--sv-accent) / 0.15)' }}
                    >
                        <Clipboard size={16} style={{ color: 'hsl(var(--sv-accent))' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: 'hsl(var(--sv-text))' }}>
                            Clipboard Sync
                        </p>
                        <p className="text-[10px]" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            {syncEnabled ? (
                                <span className="flex items-center gap-1">
                                    <Zap size={9} className="text-green-400" />
                                    Real-time sync active
                                </span>
                            ) : 'Sync disabled'}
                        </p>
                    </div>
                    {/* Sync toggle */}
                    <button
                        onClick={() => toggleSync()}
                        title={syncEnabled ? 'Disable sync' : 'Enable sync'}
                        className="sv-icon-btn w-8 h-8 rounded-xl transition-colors"
                        style={syncEnabled
                            ? { background: 'hsl(var(--sv-accent) / 0.12)', color: 'hsl(var(--sv-accent))' }
                            : {}}
                    >
                        {syncEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={onClose} className="sv-icon-btn w-8 h-8 rounded-xl">
                        <X size={16} />
                    </button>
                </div>

                {/* ── Top section: actions (fixed height, doesn't scroll) ── */}
                <div
                    className="flex-shrink-0 px-3 pt-3 pb-2 flex flex-col gap-2.5 border-b"
                    style={{ borderColor: 'hsl(var(--sv-border) / 0.4)' }}
                >
                    {/* New item alert */}
                    <AnimatePresence>
                        {newItemAlert && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="rounded-xl p-3 flex items-center gap-3"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(var(--sv-accent)/0.15), hsl(220,80%,60%)/0.08)',
                                    border: '1px solid hsl(var(--sv-accent)/0.3)',
                                }}
                            >
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'hsl(var(--sv-accent)/0.2)' }}
                                >
                                    <Clipboard size={13} style={{ color: 'hsl(var(--sv-accent))' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold" style={{ color: 'hsl(var(--sv-text))' }}>
                                        From {newItemAlert.sourceDevice?.name || 'another device'}
                                    </p>
                                    <p className="text-[11px] truncate" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                        {newItemAlert.content?.slice(0, 55) || newItemAlert.fileName || '(file)'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => copyToLocalClipboard(newItemAlert)}
                                    className="text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                                    style={{ background: 'hsl(var(--sv-accent))', color: 'white' }}
                                >
                                    Copy
                                </button>
                                <button
                                    onClick={() => setNewItemAlert(null)}
                                    className="sv-icon-btn w-5 h-5 rounded-md"
                                >
                                    <X size={11} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* File error banner */}
                    <AnimatePresence>
                        {fileError && (
                            <ErrorBanner message={fileError} onDismiss={() => setFileError(null)} />
                        )}
                    </AnimatePresence>

                    {/* Share controls */}
                    <div
                        className="rounded-xl p-3"
                        style={{ background: 'hsl(var(--sv-surface-2))', border: '1px solid hsl(var(--sv-border) / 0.4)' }}
                    >
                        <p className="text-[10px] font-semibold mb-2 uppercase tracking-wide" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            Share to all devices
                        </p>
                        <button
                            onClick={captureAndPush}
                            disabled={!syncEnabled}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                            style={{
                                background: 'hsl(var(--sv-accent) / 0.12)',
                                color: 'hsl(var(--sv-accent))',
                                border: '1px solid hsl(var(--sv-accent) / 0.2)',
                            }}
                        >
                            <ClipboardCheck size={14} />
                            Sync current clipboard
                        </button>
                        <div className="flex gap-2">
                            <input
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                                placeholder="Type or paste text to share…"
                                disabled={!syncEnabled}
                                className="sv-input flex-1 py-2 text-xs disabled:opacity-50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) handlePushText();
                                }}
                            />
                            <button
                                onClick={handlePushText}
                                disabled={!manualText.trim() || !syncEnabled || pushing}
                                className="sv-btn-primary px-3 py-2 text-xs flex-shrink-0 disabled:opacity-50"
                            >
                                {pushing
                                    ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin border-white" />
                                    : <Upload size={13} />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Drop zone */}
                    {syncEnabled && <DropZone onFileDrop={handleFileDrop} />}
                </div>

                {/* ── History section (this part scrolls independently) ── */}
                <div className="flex-1 flex flex-col min-h-0 px-3 pt-3">

                    {/* History header + controls */}
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            History ({history.length})
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={loadHistory}
                                className="sv-icon-btn w-6 h-6 rounded-lg"
                                title="Refresh"
                            >
                                <RefreshCw size={11} />
                            </button>
                            {history.length > 0 && (
                                <button
                                    onClick={() => setShowClearModal(true)}
                                    className="sv-icon-btn w-6 h-6 rounded-lg"
                                    title="Clear all"
                                    style={{ color: 'hsl(var(--sv-danger))' }}
                                >
                                    <ClipboardX size={11} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search bar */}
                    {history.length > 2 && (
                        <div className="relative mb-2 flex-shrink-0">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--sv-text-3))' }} />
                            <input
                                type="text"
                                placeholder="Search history…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="sv-input pl-7 py-1.5 text-xs w-full"
                            />
                        </div>
                    )}

                    {/* ★ Scrollable items list ★ */}
                    <div className="flex-1 overflow-y-auto scrollbar-custom pb-3">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Clipboard size={28} style={{ color: 'hsl(var(--sv-text-3))' }} />
                                <p className="text-xs text-center" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                    {search ? 'No items match your search.' : 'No clipboard history yet.\nShare something to get started!'}
                                </p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filtered.map((item) => (
                                    <HistoryItem
                                        key={item._id}
                                        item={item}
                                        onCopy={copyToLocalClipboard}
                                        onDelete={deleteItem}
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* ── Footer: encryption notice ── */}
                <div
                    className="px-4 py-2.5 border-t text-center flex-shrink-0"
                    style={{ borderColor: 'hsl(var(--sv-border) / 0.4)' }}
                >
                    <p className="text-[10px]" style={{ color: 'hsl(var(--sv-text-3))' }}>
                        🔒 AES-256 encrypted · Auto-deletes in 24h
                    </p>
                </div>
            </motion.div>
        </>
    );
};

export default ClipboardSync;
