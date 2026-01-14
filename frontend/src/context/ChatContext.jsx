import React, { createContext, useContext, useState, useEffect, useRef } from "react";
// import { conversationAPI, messageAPI } from '../services/api';
import socketService from "../services/socket";
import toast from "react-hot-toast";

// const ChatContext = createContext();

// export const useChat = () => {
//   const context = useContext(ChatContext);
//   if (!context) {
//     throw new Error('useChat must be used within ChatProvider');
//   }
//   return context;
// };

// export const ChatProvider = ({ children }) => {
//   const [conversations, setConversations] = useState([]);
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [typingUsers, setTypingUsers] = useState({});

//   useEffect(() => {
//     fetchConversations();
//     setupSocketListeners();

//     return () => {
//       socketService.removeAllListeners();
//     };
//   }, []);

//   useEffect(() => {
//     if (selectedConversation) {
//       fetchMessages(selectedConversation._id);
//       socketService.joinConversation(selectedConversation._id);
//     }

//     return () => {
//       if (selectedConversation) {
//         socketService.leaveConversation(selectedConversation._id);
//       }
//     };
//   }, [selectedConversation]);

//   const setupSocketListeners = () => {
//     // Listen for new messages
//     socketService.onNewMessage((message) => {
//       if (selectedConversation && message.conversationId === selectedConversation._id) {
//         setMessages(prev => [...prev, message]);
//       }

//       // Update conversation list
//       setConversations(prev => {
//         const updated = prev.map(conv =>
//           conv._id === message.conversationId
//             ? { ...conv, lastMessage: message, updatedAt: new Date() }
//             : conv
//         );
//         return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//       });
//     });

//     // Listen for typing
//     socketService.onUserTyping(({ userId, conversationId }) => {
//       if (selectedConversation && conversationId === selectedConversation._id) {
//         setTypingUsers(prev => ({ ...prev, [conversationId]: userId }));
//       }
//     });

//     // Listen for stop typing
//     socketService.onUserStopTyping(({ conversationId }) => {
//       setTypingUsers(prev => {
//         const updated = { ...prev };
//         delete updated[conversationId];
//         return updated;
//       });
//     });

//     // Listen for message read
//     socketService.onMessageRead(({ messageId }) => {
//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === messageId ? { ...msg, status: 'read' } : msg
//         )
//       );
//     });
//   };

//   const fetchConversations = async () => {
//     try {
//       const response = await conversationAPI.getConversations();
//       setConversations(response.data.data);
//     } catch (error) {
//       console.error('Failed to fetch conversations:', error);
//       toast.error('Failed to load conversations');
//     }
//   };

//   const fetchMessages = async (conversationId) => {
//     try {
//       setLoading(true);
//       const response = await messageAPI.getMessages(conversationId);
//       setMessages(response.data.data);
//     } catch (error) {
//       console.error('Failed to fetch messages:', error);
//       toast.error('Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendMessage = async (content, type = 'text') => {
//     if (!selectedConversation) return;

//     try {
//       const response = await messageAPI.sendMessage({
//         conversationId: selectedConversation._id,
//         content,
//         type,
//       });

//       setMessages(prev => [...prev, response.data.data]);
//       return { success: true };
//     } catch (error) {
//       console.error('Failed to send message:', error);
//       toast.error('Failed to send message');
//       return { success: false };
//     }
//   };

//   const sendMediaMessage = async (file, type) => {
//     if (!selectedConversation) return;

//     try {
//       const formData = new FormData();
//       formData.append('media', file);
//       formData.append('conversationId', selectedConversation._id);
//       formData.append('type', type);

//       const response = await messageAPI.uploadMedia(formData);
//       setMessages(prev => [...prev, response.data.data]);
//       toast.success('Media sent successfully');
//       return { success: true };
//     } catch (error) {
//       console.error('Failed to send media:', error);
//       toast.error('Failed to send media');
//       return { success: false };
//     }
//   };

//   const createConversation = async (participantId) => {
//     try {
//       const response = await conversationAPI.createConversation({
//         participantId,
//         type: 'one-on-one',
//       });

//       const newConversation = response.data.data;
//       setConversations(prev => [newConversation, ...prev]);
//       setSelectedConversation(newConversation);

//       return { success: true, conversation: newConversation };
//     } catch (error) {
//       console.error('Failed to create conversation:', error);
//       toast.error('Failed to start conversation');
//       return { success: false };
//     }
//   };

//   const deleteConversation = async (conversationId) => {
//     try {
//       await conversationAPI.deleteConversation(conversationId);
//       setConversations(prev => prev.filter(c => c._id !== conversationId));

//       if (selectedConversation?._id === conversationId) {
//         setSelectedConversation(null);
//         setMessages([]);
//       }

//       toast.success('Conversation deleted');
//     } catch (error) {
//       console.error('Failed to delete conversation:', error);
//       toast.error('Failed to delete conversation');
//     }
//   };

//   const markMessageAsRead = async (messageId) => {
//     try {
//       await messageAPI.markAsRead(messageId);
//     } catch (error) {
//       console.error('Failed to mark message as read:', error);
//     }
//   };

//   const value = {
//     conversations,
//     selectedConversation,
//     setSelectedConversation,
//     messages,
//     loading,
//     typingUsers,
//     sendMessage,
//     sendMediaMessage,
//     createConversation,
//     deleteConversation,
//     markMessageAsRead,
//     fetchConversations,
//   };

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };

const mockConversations = [
  {
    id: "1",
    name: "Design Team",
    lastMessage: "Let's finalize the mockups!",
    unread: 3,
    isGroup: true,
    members: 8,
  },
  {
    id: "2",
    name: "Sarah Chen",
    lastMessage: "The presentation was amazing!",
    unread: 0,
  },
  {
    id: "3",
    name: "Alex Rivera",
    lastMessage: "Can you review the PR?",
    unread: 1,
  },
  {
    id: "4",
    name: "Dev Squad",
    lastMessage: "Deployment successful 🚀",
    unread: 0,
    isGroup: true,
    members: 12,
  },
  {
    id: "5",
    name: "Mike Johnson",
    lastMessage: "Thanks for your help!",
    unread: 0,
  },
];
const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children, token, userId }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      socketService.socket.emit("setup", userId);

      fetchConversations();
      setupSocketListeners();
    }

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [token]);

  // useEffect(() => {
  //   if (selectedConversation && token) {
  //     fetchMessages(selectedConversation._id);
  //     socketService.joinConversation(selectedConversation._id);
  //   }

  //   return () => {
  //     if (selectedConversation) {
  //       socketService.leaveConversation(selectedConversation._id);
  //     }
  //   };
  // }, [selectedConversation]);

  const prevConversationRef = useRef(null);

useEffect(() => {
  if (!selectedConversation) return;

  if (prevConversationRef.current) {
    socketService.leaveConversation(prevConversationRef.current);
  }

  socketService.joinConversation(selectedConversation._id);
  prevConversationRef.current = selectedConversation._id;
}, [selectedConversation]);


  const setupSocketListeners = () => {
    socketService.on("message-received", (message) => {
      if (
        selectedConversation &&
        message.conversationId === selectedConversation._id
      ) {
        setMessages((prev) => [...prev, transformMessage(message)]);
        if (token) {
          api.markAsRead(message._id, token).catch(console.error);
        }
      }

      updateConversationsList(message);
    });

    socketService.on("typing", ({ userId: typingUserId, conversationId }) => {
      if (selectedConversation && conversationId === selectedConversation._id) {
        setTypingUsers((prev) => ({ ...prev, [conversationId]: typingUserId }));
      }
    });

    socketService.on("stop-typing", ({ conversationId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    });

    socketService.on("message-read", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "read" } : msg
        )
      );
    });

    socketService.on("message-deleted", ({ messageId, deleteFor }) => {
      if (deleteFor === "everyone") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: "This message was deleted", deleted: true }
              : msg
          )
        );
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    });

    socketService.on("user-online", ({ userId: onlineUserId }) => {
      setOnlineUsers((prev) => ({ ...prev, [onlineUserId]: true }));
    });

    socketService.on("user-offline", ({ userId: offlineUserId }) => {
      setOnlineUsers((prev) => ({ ...prev, [offlineUserId]: false }));
    });
  };

  const transformMessage = (msg) => ({
    id: msg._id,
    content: msg.content || "",
    sender: msg.sender._id === userId ? "user" : "other",
    timestamp: new Date(msg.createdAt),
    name: msg.sender.name,
    type: msg.type,
    mediaUrl: msg.mediaUrl,
    status: msg.status,
    deleted: msg.deleted,
  });

  const fetchConversations = async () => {
    try {
      if (!token) return;
      const response = await api.getConversations(token);
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      if (!token) return;
      setLoading(true);
      const response = await api.getMessages(conversationId, token);
      if (response.success) {
        setMessages(response.data.map(transformMessage));
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content, type = "text") => {
    if (!selectedConversation || !token) return { success: false };

    try {
      const response = await api.sendMessage(
        {
          conversationId: selectedConversation._id,
          content,
          type,
        },
        token
      );

      if (response.success) {
        socketService.socket.emit("new-message", response.data);
      }
      return { success: false };
    } catch (error) {
      console.error("Failed to send message:", error);
      return { success: false };
    }
  };

  const sendMediaMessage = async (file, type) => {
    if (!selectedConversation || !token) return { success: false };

    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("conversationId", selectedConversation._id);
      formData.append("type", type);

      const response = await api.uploadMedia(formData, token);
      if (response.success) {
        const newMessage = transformMessage(response.data);
        setMessages((prev) => [...prev, newMessage]);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Failed to send media:", error);
      return { success: false };
    }
  };

  const createNewConversation = async (user) => {
    try {
      if (!token) return;
      const response = await api.createConversation(user._id, token);
      if (response.success) {
        const newConversation = response.data;
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        return { success: true };
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return { success: false };
    }
  };

  const updateConversationsList = (message) => {
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv._id === message.conversationId
          ? {
              ...conv,
              lastMessage: message,
              updatedAt: new Date(),
            }
          : conv
      );
      return updated.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    });
  };

  let typingTimeout;

const handleTyping = () => {
  if (!selectedConversation) return;

  socketService.sendTyping(selectedConversation._id);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socketService.sendStopTyping(selectedConversation._id);
  }, 1200);
};


  const handleStopTyping = () => {
    if (selectedConversation) {
      socketService.sendStopTyping(selectedConversation._id);
    }
  };

  const getConversationName = (conversation) => {
    if (conversation.type === "group") {
      return conversation.name || "Group Chat";
    }
    const otherParticipant = conversation.participants?.find(
      (p) => p._id !== userId
    );
    return otherParticipant?.name || "Unknown User";
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === "group") {
      return null;
    }
    const otherParticipant = conversation.participants?.find(
      (p) => p._id !== userId
    );
    return otherParticipant?.avatar;
  };

  const isUserOnline = (conversation) => {
    if (conversation.type === "group") return true;
    const otherParticipant = conversation.participants?.find(
      (p) => p._id !== userId
    );
    return otherParticipant && onlineUsers[otherParticipant._id];
  };

  const value = {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    typingUsers,
    onlineUsers,
    sendMessage,
    sendMediaMessage,
    createNewConversation,
    handleTyping,
    handleStopTyping,
    fetchConversations,
    getConversationName,
    getConversationAvatar,
    isUserOnline,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
