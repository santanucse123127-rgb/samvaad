// import { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Search, Settings, ArrowLeft, Users, Hash } from "lucide-react";
// import PageTransition from "@/components/PageTransition";
// import MorphingBlob from "@/components/MorphingBlob";

// const mockConversations = [
//   { id: "1", name: "Design Team", lastMessage: "Let's finalize the mockups!", unread: 3, isGroup: true, members: 8 },
//   { id: "2", name: "Sarah Chen", lastMessage: "The presentation was amazing!", unread: 0 },
//   { id: "3", name: "Alex Rivera", lastMessage: "Can you review the PR?", unread: 1 },
//   { id: "4", name: "Dev Squad", lastMessage: "Deployment successful 🚀", unread: 0, isGroup: true, members: 12 },
//   { id: "5", name: "Mike Johnson", lastMessage: "Thanks for your help!", unread: 0 },
// ];

// const mockMessages = [
//   { id: "1", content: "Hey! How's the project coming along?", sender: "other", timestamp: new Date(Date.now() - 3600000), name: "Sarah Chen" },
//   { id: "2", content: "It's going great! Just finished the animations.", sender: "user", timestamp: new Date(Date.now() - 3500000) },
//   { id: "3", content: "That sounds awesome! Can't wait to see them.", sender: "other", timestamp: new Date(Date.now() - 3400000), name: "Sarah Chen" },
//   { id: "4", content: "I'll share a preview soon. The glassmorphism looks incredible!", sender: "user", timestamp: new Date(Date.now() - 3300000) },
//   { id: "5", content: "Perfect! The team is excited about this.", sender: "other", timestamp: new Date(Date.now() - 1800000), name: "Sarah Chen" },
// ];

// const Chat = () => {
//   const [messages, setMessages] = useState(mockMessages);
//   const [newMessage, setNewMessage] = useState("");
//   const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
//   const [showSidebar, setShowSidebar] = useState(true);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (!newMessage.trim()) return;

//     const message = {
//       id: Date.now().toString(),
//       content: newMessage,
//       sender: "user",
//       timestamp: new Date(),
//     };

//     setMessages([...messages, message]);
//     setNewMessage("");

//     setTimeout(() => {
//       const response = {
//         id: (Date.now() + 1).toString(),
//         content: "That's great to hear! Looking forward to seeing the final result.",
//         sender: "other",
//         timestamp: new Date(),
//         name: "Sarah Chen",
//       };
//       setMessages((prev) => [...prev, response]);
//     }, 1500);
//   };

//   const formatTime = (date) => {
//     return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
//   };

//   return (
//     <PageTransition>
//       <div className="min-h-screen flex relative overflow-hidden pt-16">
//         <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
//         <MorphingBlob className="-top-32 -left-32 opacity-30" color="primary" size="xl" />
//         <MorphingBlob className="-bottom-32 -right-32 opacity-30" color="accent" size="lg" />

//         <AnimatePresence>
//           {showSidebar && (
//             <motion.aside
//               className="w-80 glass border-r border-border flex flex-col relative z-10"
//               initial={{ x: -320, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: -320, opacity: 0 }}
//               transition={{ type: "spring", damping: 25 }}
//             >
//               <div className="p-4 border-b border-border">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-xl font-bold gradient-text">Messages</h2>
//                   <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
//                     <Settings className="w-5 h-5 text-muted-foreground" />
//                   </button>
//                 </div>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                   <input
//                     type="text"
//                     placeholder="Search conversations..."
//                     className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none text-sm transition-all"
//                   />
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto scrollbar-custom">
//                 {mockConversations.map((conversation, index) => (
//                   <motion.button
//                     key={conversation.id}
//                     className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${
//                       selectedConversation.id === conversation.id ? "bg-muted" : ""
//                     }`}
//                     onClick={() => setSelectedConversation(conversation)}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                   >
//                     <div className="relative">
//                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
//                         {conversation.isGroup ? (
//                           <Users className="w-5 h-5 text-primary-foreground" />
//                         ) : (
//                           <span className="text-lg font-semibold text-primary-foreground">
//                             {conversation.name.charAt(0)}
//                           </span>
//                         )}
//                       </div>
//                       {conversation.isGroup && (
//                         <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
//                       )}
//                     </div>
//                     <div className="flex-1 text-left min-w-0">
//                       <div className="flex items-center justify-between">
//                         <span className="font-medium truncate">{conversation.name}</span>
//                         {conversation.unread > 0 && (
//                           <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
//                             {conversation.unread}
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
//                     </div>
//                   </motion.button>
//                 ))}
//               </div>
//             </motion.aside>
//           )}
//         </AnimatePresence>

//         <div className="flex-1 flex flex-col relative z-10">
//           <div className="glass border-b border-border p-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 className="lg:hidden w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center"
//                 onClick={() => setShowSidebar(!showSidebar)}
//               >
//                 {showSidebar ? <ArrowLeft className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
//               </button>
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
//                 {selectedConversation.isGroup ? (
//                   <Users className="w-5 h-5 text-primary-foreground" />
//                 ) : (
//                   <span className="font-semibold text-primary-foreground">
//                     {selectedConversation.name.charAt(0)}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <h3 className="font-semibold">{selectedConversation.name}</h3>
//                 <p className="text-xs text-muted-foreground">
//                   {selectedConversation.isGroup
//                     ? `${selectedConversation.members} members`
//                     : "Online"}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <motion.button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Phone className="w-5 h-5 text-muted-foreground" />
//               </motion.button>
//               <motion.button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Video className="w-5 h-5 text-muted-foreground" />
//               </motion.button>
//               <motion.button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <MoreVertical className="w-5 h-5 text-muted-foreground" />
//               </motion.button>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-custom">
//             {messages.map((message, index) => (
//               <motion.div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
//                 <div className={`max-w-[70%] ${message.sender === "user" ? "chat-bubble-sent" : "chat-bubble-received"} px-4 py-3`}>
//                   {message.sender === "other" && message.name && (
//                     <p className="text-xs text-primary font-medium mb-1">{message.name}</p>
//                   )}
//                   <p className="text-sm">{message.content}</p>
//                   <p className="text-[10px] mt-1 opacity-60">{formatTime(message.timestamp)}</p>
//                 </div>
//               </motion.div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="p-4 border-t border-border glass">
//             <form onSubmit={handleSendMessage} className="flex items-center gap-3">
//               <motion.button type="button" className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//                 <Paperclip className="w-5 h-5 text-muted-foreground" />
//               </motion.button>
//               <div className="flex-1 relative">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="Type a message..."
//                   className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none input-glow transition-all pr-12"
//                 />
//                 <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
//                   <Smile className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
//                 </button>
//               </div>
//               <motion.button type="submit" className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center glow-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!newMessage.trim()}>
//                 <Send className="w-5 h-5" />
//               </motion.button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </PageTransition>
//   );
// };

// export default Chat;


import { useState, useRef, useEffect, createContext, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Search, Settings, ArrowLeft, Users, Hash, X, Image, File } from "lucide-react";
import { io } from 'socket.io-client';
import { useChat } from "../context/ChatContext";

// Mock data for initial state (will be replaced by real data)
const mockConversations = [
  { id: "1", name: "Design Team", lastMessage: "Let's finalize the mockups!", unread: 3, isGroup: true, members: 8 },
  { id: "2", name: "Sarah Chen", lastMessage: "The presentation was amazing!", unread: 0 },
  { id: "3", name: "Alex Rivera", lastMessage: "Can you review the PR?", unread: 1 },
  { id: "4", name: "Dev Squad", lastMessage: "Deployment successful 🚀", unread: 0, isGroup: true, members: 12 },
  { id: "5", name: "Mike Johnson", lastMessage: "Thanks for your help!", unread: 0 },
];

const Chat = ({ token }) => {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    typingUsers,
    sendMessage,
    sendMediaMessage,
    createNewConversation,
    handleTyping,
    handleStopTyping,
    getConversationName,
    isUserOnline
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !uploadPreview) return;

    if (uploadPreview) {
      const type = uploadPreview.type.startsWith('image/') ? 'image' : 
                   uploadPreview.type.startsWith('video/') ? 'video' : 'file';
      await sendMediaMessage(uploadPreview.file, type);
      setUploadPreview(null);
    } else {
      await sendMessage(newMessage, 'text');
    }
    
    setNewMessage("");
    handleStopTyping();
  };

  // const handleInputChange = (e) => {
  //   setNewMessage(e.target.value);
    
  //   handleTyping();
    
  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }
    
  //   typingTimeoutRef.current = setTimeout(() => {
  //     handleStopTyping();
  //   }, 1000);
  // };
  const handleInputChange = (e) => {
  setNewMessage(e.target.value);
  handleTyping();
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
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewChat = async (user) => {
    await createNewConversation(user);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const filteredConversations = useMemo(() => {
  return conversations.filter(conv =>
    getConversationName(conv)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
}, [conversations, searchQuery]);


  const isTyping = selectedConversation && typingUsers[selectedConversation._id];

  return (
    <div className="min-h-screen flex relative overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 flex flex-col relative z-10 shadow-xl"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Messages
                </h2>
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation, index) => (
                <motion.button
                  key={conversation._id}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    selectedConversation?._id === conversation._id ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {conversation.isGroup ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-lg font-semibold text-white">
                          {conversation.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {isUserOnline(conversation) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{conversation.name}</span>
                      {conversation.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conversation.lastMessage}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <ArrowLeft className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
            </button>
            {selectedConversation && (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  {selectedConversation.isGroup ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <span className="font-semibold text-white">
                      {selectedConversation.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.isGroup
                      ? `${selectedConversation.members} members`
                      : isUserOnline(selectedConversation) ? "Online" : "Offline"}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <motion.button className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`max-w-[70%] ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-3xl rounded-tr-sm"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-3xl rounded-tl-sm"
                  } px-4 py-3 shadow-lg`}>
                    {message.sender === "other" && message.name && (
                      <p className="text-xs text-purple-600 font-medium mb-1">{message.name}</p>
                    )}
                    {message.type === 'image' && message.mediaUrl && (
                      <img src={message.mediaUrl} alt="Shared" className="rounded-lg mb-2 max-w-full" />
                    )}
                    {message.type === 'file' && message.mediaUrl && (
                      <div className="flex items-center gap-2 mb-2">
                        <File className="w-5 h-5" />
                        <span className="text-sm">File attachment</span>
                      </div>
                    )}
                    <p className="text-sm">{message.deleted ? <em>{message.content}</em> : message.content}</p>
                    <p className="text-[10px] mt-1 opacity-60">{formatTime(message.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-3xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {uploadPreview && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              {uploadPreview.type.startsWith('image/') ? (
                <img src={uploadPreview.preview} alt="Preview" className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                  <File className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{uploadPreview.name}</p>
                <p className="text-xs text-gray-500">Ready to send</p>
              </div>
              <button
                onClick={() => setUploadPreview(null)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:outline-none transition-all pr-12"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" />
              </button>
            </div>
            <motion.button
              type="submit"
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!newMessage.trim() && !uploadPreview}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;