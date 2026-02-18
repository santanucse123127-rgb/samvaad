import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Crown, LogOut, Trash2, UserPlus, Shield } from 'lucide-react';
import { useChat } from '../context/ChatContext';

const GroupInfoModal = ({ isOpen, onClose, conversation }) => {
    const {
        userId,
        removeParticipant,
        leaveGroup,
        makeAdmin,
        removeAdmin,
        getConversationName,
        getConversationAvatar,
    } = useChat();

    const [showConfirmLeave, setShowConfirmLeave] = useState(false);

    if (!isOpen || !conversation || conversation.type !== 'group') return null;

    const isAdmin = conversation.groupAdmin?.includes(userId);
    const participants = conversation.participants || [];

    const handleMakeAdmin = async (participantId) => {
        await makeAdmin(participantId);
    };

    const handleRemoveAdmin = async (participantId) => {
        await removeAdmin(participantId);
    };

    const handleRemoveParticipant = async (participantId) => {
        if (confirm('Are you sure you want to remove this user?')) {
            await removeParticipant(participantId);
        }
    };

    const handleLeaveGroup = async () => {
        await leaveGroup();
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                        <h2 className="text-xl font-bold text-white">Group Info</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Group Header Info */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                                {getConversationAvatar(conversation) ? (
                                    <img
                                        src={getConversationAvatar(conversation)}
                                        alt="Group"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {getConversationName(conversation).charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">
                                {getConversationName(conversation)}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {participants.length} members
                            </p>
                        </div>

                        {/* Participants List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                    Participants
                                </h4>
                                {isAdmin && (
                                    <button className="text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-1">
                                        <UserPlus className="w-3 h-3" /> Add Participant
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {participants.map((participant) => {
                                    const isParticipantAdmin = conversation.groupAdmin?.includes(participant._id);
                                    const isMe = participant._id === userId;

                                    return (
                                        <div
                                            key={participant._id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                                                    {participant.avatar ? (
                                                        <img
                                                            src={participant.avatar}
                                                            alt={participant.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="font-semibold text-white">
                                                            {participant.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-200">
                                                            {isMe ? 'You' : participant.name}
                                                        </span>
                                                        {isParticipantAdmin && (
                                                            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/30">
                                                                ADMIN
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {participant.email}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Admin Actions */}
                                            {isAdmin && !isMe && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isParticipantAdmin ? (
                                                        <button
                                                            onClick={() => handleRemoveAdmin(participant._id)}
                                                            className="p-2 hover:bg-gray-700 rounded-lg text-yellow-500"
                                                            title="Dismiss as Admin"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleMakeAdmin(participant._id)}
                                                            className="p-2 hover:bg-gray-700 rounded-lg text-green-500"
                                                            title="Make Admin"
                                                        >
                                                            <Crown className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveParticipant(participant._id)}
                                                        className="p-2 hover:bg-gray-700 rounded-lg text-red-500"
                                                        title="Remove User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-800 bg-gray-900">
                        <button
                            onClick={() => setShowConfirmLeave(true)}
                            className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Leave Group
                        </button>
                    </div>

                    {/* Confirm Leave Dialog */}
                    <AnimatePresence>
                        {showConfirmLeave && (
                            <motion.div
                                className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-50 p-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="text-center">
                                    <h4 className="text-xl font-bold text-white mb-2">
                                        Leave Group?
                                    </h4>
                                    <p className="text-gray-400 mb-6">
                                        You won't be able to send messages to this group anymore.
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => setShowConfirmLeave(false)}
                                            className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleLeaveGroup}
                                            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                        >
                                            Leave
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
