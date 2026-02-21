import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Users, Check } from 'lucide-react';
import { getUsers } from '../services/chatAPI';
import { useChat } from '../context/ChatContext';

const NewChatModal = ({ isOpen, onClose, onCreateChat, token }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'group'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const { createGroupConversation } = useChat();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUsers([]);
      setGroupName('');
      setActiveTab('chat');
      setCreateError('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(token);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = async (user) => {
    if (activeTab === 'chat') {
      try {
        const result = await onCreateChat(user);
        if (result && result.success) {
          onClose();
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    } else {
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u._id === user._id);
        if (isSelected) {
          return prev.filter(u => u._id !== user._id);
        } else {
          return [...prev, user];
        }
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;
    setCreating(true);
    setCreateError('');
    const participantIds = selectedUsers.map(u => u._id);
    const result = await createGroupConversation(participantIds, groupName.trim());
    setCreating(false);
    if (result.success) {
      onClose();
    } else {
      setCreateError(result.error || 'Failed to create group. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          className="bg-card border border-border/50 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-wa-accent/5 flex-shrink-0">
            <h2 className="text-xl font-bold text-wa-text-primary">
              New Conversation
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-wa-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/20 p-1 bg-muted/30">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-bold transition-all relative rounded-2xl ${activeTab === 'chat' ? 'text-wa-accent bg-card shadow-sm' : 'text-wa-text-secondary hover:text-wa-text-primary'}`}
            >
              <span className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" /> Message
              </span>
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-3 text-sm font-bold transition-all relative rounded-2xl ${activeTab === 'group' ? 'text-wa-accent bg-card shadow-sm' : 'text-wa-text-secondary hover:text-wa-text-primary'}`}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Group
              </span>
            </button>
          </div>

          {/* Search & Group Input Container */}
          <div className="p-4 space-y-3 bg-muted/10 border-b border-border/50">
            {activeTab === 'group' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl bg-card border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium"
                />
              </motion.div>
            )}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-wa-text-secondary" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3 rounded-2xl bg-card border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 outline-none transition-all font-medium text-sm"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto min-h-[300px] scrollbar-custom">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-accent border-t-transparent" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 text-wa-text-secondary font-medium">
                No users found
              </div>
            ) : (
              <div className="py-2">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.some(u => u._id === user._id);
                  return (
                    <motion.button
                      key={user._id}
                      onClick={() => handleUserClick(user)}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-wa-sidebar-hover transition-all px-6 ${isSelected && activeTab === 'group' ? 'bg-wa-accent/5' : ''}`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-wa-accent/10 flex items-center justify-center overflow-hidden border">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-wa-accent">{user.name[0]}</span>
                          )}
                        </div>
                        {activeTab === 'group' && isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-wa-accent rounded-full flex items-center justify-center border-2 border-card">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-wa-text-primary text-[15px]">{user.name}</h3>
                        <p className="text-[13px] text-wa-text-secondary">{user.email}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer for Group */}
          {activeTab === 'group' && (
            <motion.div
              className="p-5 border-t border-border/50 bg-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-sm font-bold text-wa-text-primary">
                  {selectedUsers.length} selected
                </span>
                <span className="text-xs font-bold text-wa-text-secondary uppercase">
                  Min 2 members
                </span>
              </div>
              {createError && (
                <p className="text-xs text-red-400 text-center mb-3 px-1">{createError}</p>
              )}
              <button
                onClick={handleCreateGroup}
                disabled={selectedUsers.length < 2 || !groupName.trim() || creating}
                className="w-full py-4 rounded-2xl bg-wa-accent text-white font-bold text-lg shadow-xl shadow-wa-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Creating &amp; sending invites…</>
                ) : 'Create Group'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewChatModal;