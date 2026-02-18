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

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUsers([]);
      setGroupName('');
      setActiveTab('chat');
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
        const result = await onCreateChat(user); // existing 1-on-1 logic
        if (result && result.success) {
          onClose();
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    } else {
      // Toggle selection for group
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
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    if (selectedUsers.length < 2) {
      alert('Please select at least 2 members');
      return;
    }

    const participantIds = selectedUsers.map(u => u._id);
    const result = await createGroupConversation(participantIds, groupName);

    if (result.success) {
      onClose();
    }
  };

  if (!isOpen) return null;

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
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <h2 className="text-xl font-bold text-white">
              New Conversation
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'chat' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" /> Direct Message
              </span>
              {activeTab === 'chat' && (
                <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" layoutId="underline" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'group' ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> New Group
              </span>
              {activeTab === 'group' && (
                <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" layoutId="underline" />
              )}
            </button>
          </div>

          {/* Group Name Input */}
          {activeTab === 'group' && (
            <div className="p-4 border-b border-gray-800 animated-fade-in">
              <input
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
              />
            </div>
          )}

          {/* Search */}
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUsers.some(u => u._id === user._id);
                return (
                  <motion.button
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0 ${isSelected && activeTab === 'group' ? 'bg-purple-900/20' : ''
                      }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {activeTab === 'group' && isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-200">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Footer for Group */}
          {activeTab === 'group' && (
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  {selectedUsers.length} selected
                </span>
                <span className="text-xs text-gray-500">
                  (Min 2)
                </span>
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={selectedUsers.length < 2 || !groupName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewChatModal;