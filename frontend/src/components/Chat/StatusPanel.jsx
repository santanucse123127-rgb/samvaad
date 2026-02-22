import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Camera, Send, CheckCircle2, Trash2 } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const StatusPanel = () => {
    const { statuses, addStatus, setStatusSeen, removeStatus } = useChat();
    const { user } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStatusContent, setNewStatusContent] = useState("");
    const [newStatusType, setNewStatusType] = useState("text"); // text, image
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [viewingStatusIndex, setViewingStatusIndex] = useState(0);

    const fileInputRef = useRef(null);

    const handleAddStatus = async () => {
        if (!newStatusContent.trim()) return;
        const res = await addStatus({
            content: newStatusContent,
            type: newStatusType,
        });
        if (res.success) {
            setShowAddModal(false);
            setNewStatusContent("");
        }
    };

    const myStatus = statuses.find(s => s.user._id === user._id);
    const othersStatuses = statuses.filter(s => s.user._id !== user._id);

    const openViewer = (group) => {
        setSelectedGroup(group);
        setViewingStatusIndex(0);
        // Mark first as seen if not self
        if (group.user._id !== user._id) {
            setStatusSeen(group.items[0]._id);
        }
    };

    const nextStatus = () => {
        if (!selectedGroup) return;
        if (viewingStatusIndex < selectedGroup.items.length - 1) {
            const nextIdx = viewingStatusIndex + 1;
            setViewingStatusIndex(nextIdx);
            if (selectedGroup.user._id !== user._id) {
                setStatusSeen(selectedGroup.items[nextIdx]._id);
            }
        } else {
            setSelectedGroup(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
                {/* My Status */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">My Status</p>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <div
                            className="relative cursor-pointer"
                            onClick={() => myStatus ? openViewer(myStatus) : setShowAddModal(true)}
                        >
                            <div className={`w-12 h-12 rounded-full p-0.5 border-2 ${myStatus ? 'border-sv-accent' : 'border-dashed border-white/20'}`}>
                                <img
                                    src={user.avatar || "/default-avatar.png"}
                                    alt="Me"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            {!myStatus && (
                                <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-sv-accent rounded-full flex items-center justify-center border-2 border-[#1a1a1b]">
                                    <Plus size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-white">My Status</h4>
                            <p className="text-[10px] text-white/40">
                                {myStatus ? `${myStatus.items.length} updates` : "Tap to add status"}
                            </p>
                        </div>
                        {myStatus && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Updates */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Recent Updates</p>
                    {othersStatuses.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-4 opacity-20">
                            <Camera size={32} />
                            <p className="text-[11px] font-medium px-8">No status updates from your contacts yet.</p>
                        </div>
                    ) : (
                        othersStatuses.map((group) => {
                            const hasUnseen = group.items.some(item => !item.seenBy?.some(s => s.user === user._id));
                            return (
                                <div
                                    key={group.user._id}
                                    onClick={() => openViewer(group)}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className={`w-12 h-12 rounded-full p-0.5 border-2 ${hasUnseen ? 'border-sv-accent' : 'border-white/10'}`}>
                                        <img
                                            src={group.user.avatar || "/default-avatar.png"}
                                            alt={group.user.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">{group.user.name}</h4>
                                        <p className="text-[10px] text-white/40 truncate">
                                            {new Date(group.items[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Status Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#1a1a1b]/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6">
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <X size={20} />
                            </button>
                            <h3 className="text-sm font-black uppercase tracking-widest">New Status</h3>
                            <div className="w-10 h-10" />
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
                            <div className="w-full max-w-md relative">
                                <textarea
                                    className="w-full bg-transparent text-center text-3xl font-bold placeholder:text-white/10 border-none focus:ring-0 resize-none min-h-[200px]"
                                    placeholder="Type something..."
                                    value={newStatusContent}
                                    onChange={e => setNewStatusContent(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="p-8 flex items-center justify-center gap-4">
                            <button
                                onClick={handleAddStatus}
                                className="w-16 h-16 rounded-full bg-sv-accent text-white flex items-center justify-center shadow-2xl shadow-sv-accent/40 active:scale-90 transition-all"
                            >
                                <Send size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Viewer */}
            <AnimatePresence>
                {selectedGroup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                        onClick={nextStatus}
                    >
                        {/* Progress Bars */}
                        <div className="absolute top-0 inset-x-0 p-4 pt-8 flex gap-1.5 z-10">
                            {selectedGroup.items.map((_, idx) => (
                                <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-white transition-all duration-[5000ms] ease-linear
                      ${idx < viewingStatusIndex ? 'w-full' : idx === viewingStatusIndex ? 'w-full' : 'w-0'}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="absolute top-10 inset-x-0 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <img src={selectedGroup.user.avatar || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                <div>
                                    <p className="text-sm font-bold">{selectedGroup.user.name}</p>
                                    <p className="text-[10px] opacity-60">{new Date(selectedGroup.items[viewingStatusIndex].createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedGroup(null); }}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-center p-8">
                            <motion.div
                                key={viewingStatusIndex}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                className="text-3xl font-black text-center max-w-lg leading-tight"
                            >
                                {selectedGroup.items[viewingStatusIndex].content}
                            </motion.div>
                        </div>

                        {/* Footer / Delete op */}
                        {selectedGroup.user._id === user._id && (
                            <div className="absolute bottom-10 inset-x-0 p-4 flex justify-center z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeStatus(selectedGroup.items[viewingStatusIndex]._id);
                                        nextStatus();
                                    }}
                                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-sv-danger/20 hover:text-sv-danger transition-all flex items-center justify-center"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusPanel;
