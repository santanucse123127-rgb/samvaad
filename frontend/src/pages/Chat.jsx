import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  Settings,
  ArrowLeft,
  Users,
  X,
  Image,
  File,
  Plus,
  Mic,
  Check,
  CheckCheck,
  Reply,
  Forward,
  Star,
  Trash2,
  Edit,
} from "lucide-react";
import { useChat } from "../context/ChatContext";
import NewChatModal from "../components/NewChatModal";
import MessageItem from "../components/Chat/MessageItem";
import EmojiPicker from "../components/Chat/EmojiPicker";
import { getUsers } from "../services/chatAPI";

const Chat = ({ token }) => {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    typingUsers,
    recordingVoice,
    sendMessage,
    sendMediaMessage,
    createNewConversation,
    handleTyping,
    handleStopTyping,
    getConversationName,
    getConversationAvatar,
    isUserOnline,
    getLastSeen,
    addReaction,
    removeReaction,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [load, setLoad] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  
  const fetchUsers = async () => {
      try {
        setLoad(true);
        const response = await getUsers(token);
        if (response.success) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoad(false);
      }
    };
    useEffect(() => {
    fetchUsers();
  },[token])
    const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log("Fil con : ", filteredUsers)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !uploadPreview) return;

    if (uploadPreview) {
      const type = uploadPreview.type.startsWith('image/') ? 'image' :
                   uploadPreview.type.startsWith('video/') ? 'video' :
                   uploadPreview.type.startsWith('audio/') ? 'voice' : 'file';
      await sendMediaMessage(uploadPreview.file, type);
      setUploadPreview(null);
    } else {
      await sendMessage(newMessage, 'text', replyToMessage?._id);
    }

    setNewMessage("");
    setReplyToMessage(null);
    handleStopTyping();
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };


  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview({
          file,
          preview: e.target.result,
          type: file.type,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewChat = async (user) => {
    const result = await createNewConversation(user);
    if (result.success) {
      setShowNewChatModal(false);
    }
    return result;
  };

      const handleUserClick = async (user) => {
  console.log('👤 User clicked:', user);
  console.log('🎯 Calling onCreateChat...');
  
  try {
    const result = await handleNewChat(user);
    console.log('✅ onCreateChat result:', result);
  } catch (error) {
    console.error('❌ Error in handleUserClick:', error);
  }
};

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Last seen recently";
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return `Last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  // const filteredConversations = useMemo(() => {
  //   return conversations.filter((conv) =>
  //     getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // }, [conversations, searchQuery, getConversationName]);
  // console.log("Filter convo : ",filteredConversations)

  const isTyping = selectedConversation && typingUsers[selectedConversation._id];
  const isRecordingVoice = selectedConversation && recordingVoice[selectedConversation._id];

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a0f1e]">
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            className="w-80 bg-[#111827] border-r border-gray-800 flex flex-col relative z-10 shadow-2xl"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Messages
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setShowNewChatModal(true)}
                    className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center transition-all shadow-lg hover:shadow-purple-500/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                  <button className="w-9 h-9 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-sm transition-all text-gray-200 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            {/* <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                  <Users className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-2">Start a new chat to begin messaging</p>
                </div>
              ) : (
                filteredConversations.map((conversation, index) => {
                  const isOnline = isUserOnline(conversation);
                  // const unreadCount = conversation?.unreadCount?.get(conversation._id) || 0;
                  const unread =
  conversation.unreadCount?.[conversation._id] ?? 0;
                  
                  return (
                    <motion.button
                      key={conversation._id}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-all border-b border-gray-800/50 ${
                        selectedConversation?._id === conversation._id
                          ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-l-4 border-l-purple-500"
                          : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative flex-shrink-0">
                        {getConversationAvatar(conversation) ? (
                          <img
                            src={getConversationAvatar(conversation)}
                            alt={getConversationName(conversation)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            {conversation.type === "group" ? (
                              <Users className="w-6 h-6 text-white" />
                            ) : (
                              <span className="text-lg font-semibold text-white">
                                {getConversationName(conversation)[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#111827]" />
                        )}
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate text-gray-200">
                            {getConversationName(conversation)}
                          </span>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.updatedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.content || "No messages yet"}
                          </p>
                          {unreadCount > 0 && (
                            <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs flex items-center justify-center font-medium">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div> */}

            <div className=" overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.button
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </motion.button>
              ))
            )}
          </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 h-screen">
        {/* Chat Header */}
        <div className="bg-[#111827] border-b border-gray-800 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            
            {selectedConversation ? (
              <>
                <div className="relative flex-shrink-0">
                  {getConversationAvatar(selectedConversation) ? (
                    <img
                      src={getConversationAvatar(selectedConversation)}
                      alt={getConversationName(selectedConversation)}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {selectedConversation.type === "group" ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <span className="font-semibold text-white">
                          {getConversationName(selectedConversation)[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                  {isUserOnline(selectedConversation) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111827]" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-200">
                    {getConversationName(selectedConversation)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isTyping ? (
                      <span className="text-purple-400">typing...</span>
                    ) : isRecordingVoice ? (
                      <span className="text-red-400">recording voice...</span>
                    ) : isUserOnline(selectedConversation) ? (
                      "Online"
                    ) : (
                      formatLastSeen(getLastSeen(selectedConversation))
                    )}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-200">Select a chat</h3>
                <p className="text-xs text-gray-500">Choose a conversation to start messaging</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              className="w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5 text-gray-400" />
            </motion.button>
            <motion.button
              className="w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Video className="w-5 h-5 text-gray-400" />
            </motion.button>
            <motion.button
              className="w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-[#0a0f1e] via-[#0d1425] to-[#0a0f1e] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
          ) : !selectedConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Welcome to NEXUS Chat</h3>
              <p className="text-sm text-gray-500">Select a conversation or start a new chat</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-2">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={message.sender === "user"}
                  showAvatar={
                    index === 0 ||
                    messages[index - 1].sender !== message.sender
                  }
                  getMessageStatusIcon={getMessageStatusIcon}
                  onReply={setReplyToMessage}
                  onReaction={addReaction}
                  index={index}
                />
              ))}
              
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div
              className="px-4 py-3 bg-[#111827] border-t border-gray-800 flex items-center justify-between"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-purple-500 rounded-full" />
                <div>
                  <p className="text-xs text-purple-400 font-medium">
                    Replying to {replyToMessage.name}
                  </p>
                  <p className="text-sm text-gray-400 truncate max-w-md">
                    {replyToMessage.content}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload Preview */}
        <AnimatePresence>
          {uploadPreview && (
            <motion.div
              className="p-4 border-t border-gray-800 bg-[#111827]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                {uploadPreview.type.startsWith('image/') ? (
                  <img
                    src={uploadPreview.preview}
                    alt="Preview"
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : uploadPreview.type.startsWith('video/') ? (
                  <video
                    src={uploadPreview.preview}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                    <File className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {uploadPreview.name}
                  </p>
                  <p className="text-xs text-gray-500">Ready to send</p>
                </div>
                <button
                  onClick={() => setUploadPreview(null)}
                  className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#111827]">
          {showEmojiPicker && (
            <div className="mb-3">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx,audio/*"
            />
            
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </motion.button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none transition-all pr-12 text-gray-200 placeholder-gray-500"
                disabled={!selectedConversation}
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              >
                <Smile className="w-5 h-5 text-gray-400 hover:text-gray-300" />
              </button>
            </div>
            
            {newMessage.trim() || uploadPreview ? (
              <motion.button
                type="submit"
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedConversation}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                  isRecording
                    ? "bg-red-600 shadow-red-500/30 animate-pulse"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 shadow-purple-500/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedConversation}
              >
                <Mic className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </form>
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleNewChat}
        token={token}
      />
    </div>
  );
};

export default Chat;