import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Users, Crown, LogOut, Trash2, UserPlus, Shield,
    Edit2, Check, Camera, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

/* ─── tiny Avatar ─── */
const Av = ({ src, name, size = 12 }) => (
    <div
        className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-bold"
        style={{
            width: size * 4, height: size * 4,
            background: 'linear-gradient(135deg,hsl(var(--sv-accent)/0.3),hsl(var(--sv-accent-2)/0.3))',
            color: 'hsl(var(--sv-accent))',
            fontSize: size * 1.5,
        }}
    >
        {src
            ? <img src={src} alt={name} className="w-full h-full object-cover" />
            : name?.[0]?.toUpperCase()
        }
    </div>
);

const GroupInfoModal = ({ isOpen, onClose, conversation }) => {
    const {
        userId, token,
        removeParticipant, leaveGroup, makeAdmin, removeAdmin,
        getConversationName, getConversationAvatar, updateGroupInfo,
    } = useChat();

    const [showConfirmLeave, setShowConfirmLeave] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editAvatar, setEditAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [removeTarget, setRemoveTarget] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen || !conversation || conversation.type !== 'group') return null;

    const isAdmin = conversation.groupAdmin?.some(
        (a) => (typeof a === 'object' ? a._id : a)?.toString() === userId
    );
    const participants = conversation.participants || [];

    /* ── edit helpers ── */
    const openEdit = () => {
        setEditName(conversation.groupName || '');
        setEditBio(conversation.groupDescription || '');
        setEditAvatar(null);
        setAvatarPreview(null);
        setEditMode(true);
    };

    const handleAvatarFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setEditAvatar(ev.target.result);
            setAvatarPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        const payload = {
            groupName: editName.trim() || conversation.groupName,
            groupDescription: editBio.trim(),
        };
        if (editAvatar) payload.groupAvatar = editAvatar;
        await updateGroupInfo(conversation._id, payload);
        setSaving(false);
        setEditMode(false);
    };

    const handleRemoveParticipant = async (participantId) => {
        setRemoveTarget(null);
        await removeParticipant(participantId);
    };

    const handleLeaveGroup = async () => {
        await leaveGroup();
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <motion.div
                    className="rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative"
                    style={{
                        background: 'hsl(var(--sv-surface-3))',
                        border: '1px solid hsl(var(--sv-border))',
                        maxHeight: '92vh',
                    }}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                >
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                        style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                        <span className="font-bold text-lg" style={{ color: 'hsl(var(--sv-text))' }}>
                            Group Info
                        </span>
                        <div className="flex items-center gap-1">
                            {isAdmin && !editMode && (
                                <button
                                    onClick={openEdit}
                                    className="sv-icon-btn w-8 h-8 rounded-xl"
                                    title="Edit group"
                                >
                                    <Edit2 size={15} />
                                </button>
                            )}
                            <button onClick={onClose} className="sv-icon-btn w-8 h-8 rounded-xl">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-custom">
                        {/* ── Group Avatar & Name ── */}
                        <div className="flex flex-col items-center px-5 py-6 gap-3">
                            <div className="relative">
                                <div
                                    className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-4 font-black text-4xl"
                                    style={{
                                        borderColor: 'hsl(var(--sv-accent)/0.3)',
                                        background: 'linear-gradient(135deg,hsl(var(--sv-accent)/0.2),hsl(var(--sv-accent-2)/0.1))',
                                        color: 'hsl(var(--sv-accent))',
                                    }}
                                >
                                    {(avatarPreview || getConversationAvatar(conversation))
                                        ? <img src={avatarPreview || getConversationAvatar(conversation)} className="w-full h-full object-cover" alt="group" />
                                        : getConversationName(conversation)?.[0]?.toUpperCase()
                                    }
                                </div>
                                {editMode && (
                                    <>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2"
                                            style={{ background: 'hsl(var(--sv-accent))', borderColor: 'hsl(var(--sv-surface-3))', color: 'white' }}
                                        >
                                            <Camera size={13} />
                                        </button>
                                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarFile} />
                                    </>
                                )}
                            </div>

                            {editMode ? (
                                <div className="w-full space-y-2">
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Group name"
                                        className="sv-input text-center font-semibold py-2 w-full text-sm"
                                        maxLength={60}
                                    />
                                    <textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        placeholder="Group description (optional)"
                                        rows={2}
                                        className="sv-input w-full text-sm py-2 resize-none"
                                        maxLength={200}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="flex-1 py-2 rounded-xl text-sm font-medium border"
                                            style={{ borderColor: 'hsl(var(--sv-border))', color: 'hsl(var(--sv-text-2))' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={saving || !editName.trim()}
                                            className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
                                            style={{ background: 'hsl(var(--sv-accent))', color: 'white' }}
                                        >
                                            {saving
                                                ? <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                                : <><Check size={14} /> Save</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <p className="font-bold text-lg" style={{ color: 'hsl(var(--sv-text))' }}>
                                            {getConversationName(conversation)}
                                        </p>
                                        {conversation.groupDescription && (
                                            <p className="text-sm mt-1 max-w-xs" style={{ color: 'hsl(var(--sv-text-2))' }}>
                                                {conversation.groupDescription}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: 'hsl(var(--sv-accent)/0.12)', color: 'hsl(var(--sv-accent))' }}>
                                        <Users size={11} /> {participants.length} members
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Participants ── */}
                        <div className="px-4 pb-2">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                    Members
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                {participants.map((participant) => {
                                    const pid = participant._id;
                                    const isParticipantAdmin = conversation.groupAdmin?.some(
                                        (a) => (typeof a === 'object' ? a._id : a)?.toString() === pid?.toString()
                                    );
                                    const isMe = pid?.toString() === userId;

                                    return (
                                        <div
                                            key={pid}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all"
                                            style={{ background: 'transparent' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Av src={participant.avatar} name={participant.name} size={10} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--sv-text))' }}>
                                                        {isMe ? 'You' : participant.name}
                                                    </span>
                                                    {isParticipantAdmin && (
                                                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight"
                                                            style={{ background: 'hsl(var(--sv-accent)/0.12)', color: 'hsl(var(--sv-accent))' }}>
                                                            <Shield size={9} /> Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs truncate" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                                    {participant.email}
                                                </p>
                                            </div>

                                            {/* Admin contextual actions */}
                                            {isAdmin && !isMe && (
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isParticipantAdmin ? (
                                                        <button
                                                            onClick={() => removeAdmin(pid)}
                                                            title="Dismiss admin"
                                                            className="sv-icon-btn w-7 h-7 rounded-lg"
                                                            style={{ color: '#f59e0b' }}
                                                        >
                                                            <Shield size={13} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => makeAdmin(pid)}
                                                            title="Make admin"
                                                            className="sv-icon-btn w-7 h-7 rounded-lg"
                                                            style={{ color: '#22c55e' }}
                                                        >
                                                            <Crown size={13} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setRemoveTarget(participant)}
                                                        title="Remove member"
                                                        className="sv-icon-btn w-7 h-7 rounded-lg"
                                                        style={{ color: 'hsl(var(--sv-danger))' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Leave Group ── */}
                        <div className="px-4 py-4">
                            <button
                                onClick={() => setShowConfirmLeave(true)}
                                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                                style={{ background: 'hsl(var(--sv-danger)/0.08)', color: 'hsl(var(--sv-danger))', border: '1px solid hsl(var(--sv-danger)/0.2)' }}
                            >
                                <LogOut size={15} /> Leave Group
                            </button>
                        </div>
                    </div>

                    {/* ── Confirm Leave ── */}
                    <AnimatePresence>
                        {showConfirmLeave && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center z-10 p-6 rounded-[28px]"
                                style={{ background: 'hsl(var(--sv-surface-3)/0.96)', backdropFilter: 'blur(8px)' }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <div className="text-center max-w-xs w-full">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: 'hsl(var(--sv-danger)/0.12)', color: 'hsl(var(--sv-danger))' }}>
                                        <LogOut size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--sv-text))' }}>Leave group?</h4>
                                    <p className="text-sm mb-6" style={{ color: 'hsl(var(--sv-text-2))' }}>
                                        You won't receive messages from this group anymore.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowConfirmLeave(false)}
                                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                                            style={{ borderColor: 'hsl(var(--sv-border))', color: 'hsl(var(--sv-text-2))' }}>
                                            Cancel
                                        </button>
                                        <button onClick={handleLeaveGroup}
                                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                                            style={{ background: 'hsl(var(--sv-danger))', color: 'white' }}>
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Confirm Remove Member ── */}
                    <AnimatePresence>
                        {removeTarget && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center z-10 p-6 rounded-[28px]"
                                style={{ background: 'hsl(var(--sv-surface-3)/0.96)', backdropFilter: 'blur(8px)' }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                                <div className="text-center max-w-xs w-full">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: 'hsl(var(--sv-danger)/0.12)', color: 'hsl(var(--sv-danger))' }}>
                                        <AlertTriangle size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--sv-text))' }}>
                                        Remove {removeTarget.name}?
                                    </h4>
                                    <p className="text-sm mb-6" style={{ color: 'hsl(var(--sv-text-2))' }}>
                                        They will be removed from the group.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setRemoveTarget(null)}
                                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                                            style={{ borderColor: 'hsl(var(--sv-border))', color: 'hsl(var(--sv-text-2))' }}>
                                            Cancel
                                        </button>
                                        <button onClick={() => handleRemoveParticipant(removeTarget._id)}
                                            className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                                            style={{ background: 'hsl(var(--sv-danger))', color: 'white' }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GroupInfoModal;
