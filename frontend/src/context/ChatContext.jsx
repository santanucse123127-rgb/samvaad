import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import socketService from "../services/socket";
import api from "../services/chatAPI";

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
  const [recordingVoice, setRecordingVoice] = useState({});
  const selectedConversationRef = useRef(null);

  const prevConversationRef = useRef(null);
  const messagesCache = useRef({});
  console.log("Sel convo : ", selectedConversation);

  console.log("🎯 ChatContext initialized");

  // Initialize socket and fetch initial data
  useEffect(() => {
    if (token && userId) {
      console.log("🚀 Initializing chat...");
      socketService.connect(token);
      socketService.emit("setup", userId);
      fetchConversations();
    }

    return () => {
      console.log("🧹 Cleaning up...");
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) return;

    setupSocketListeners();

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Handle conversation selection
  useEffect(() => {
    if (!selectedConversation) return;

    // Leave previous room
    if (prevConversationRef.current) {
      socketService.leaveConversation(prevConversationRef.current);
    }

    // Join new room
    socketService.joinConversation(selectedConversation._id);
    prevConversationRef.current = selectedConversation._id;

    // Fetch messages (with caching)
    if (messagesCache.current[selectedConversation._id]) {
      setMessages(messagesCache.current[selectedConversation._id]);
    } else {
      fetchMessages(selectedConversation._id);
    }

    // Mark messages as read
    socketService.emit("mark-messages-read", {
      conversationId: selectedConversation._id,
    });
  }, [selectedConversation]);

  const setupSocketListeners = useCallback(() => {
    console.log("🎧 Setting up socket listeners...");

    // New message received
    // socketService.on("message-received", (message) => {
    //   console.log("📩 Message received:", message);

    //   const transformedMessage = transformMessage(message);

    //   // Update messages if in current conversation
    //   if (
    //     selectedConversation &&
    //     message.conversationId === selectedConversation._id
    //   ) {
    //     // setMessages((prev) => {
    //     //   const updated = [...prev, transformedMessage];
    //     //   messagesCache.current[selectedConversation._id] = updated;
    //     //   return updated;
    //     // });

    //     setMessages((prev) => {
    //       // 🔥 remove temp messages
    //       const filtered = prev.filter((m) => !m.id.startsWith("temp-"));
    //       const updated = [...filtered, transformedMessage];
    //       messagesCache.current[selectedConversation._id] = updated;
    //       return updated;
    //     });

    //     // Auto-mark as read if conversation is open
    //     if (token) {
    //       setTimeout(() => {
    //         api.markAsRead(message._id, token).catch(console.error);
    //       }, 500);
    //     }
    //   }

    //   // Update conversations list
    //   updateConversationsList(message);

    //   // Play notification sound if not in conversation
    //   if (
    //     !selectedConversation ||
    //     message.conversationId !== selectedConversation._id
    //   ) {
    //     playNotificationSound();
    //   }
    // });

    socketService.on("message-received", (message) => {
      const transformedMessage = transformMessage(message);

      // ALWAYS cache per conversation
      const convId = message.conversationId;
      const cached = messagesCache.current[convId] || [];
      messagesCache.current[convId] = [...cached, transformedMessage];

      const currentConv = selectedConversationRef.current;

      // Only update UI if this conversation is open
      if (currentConv && currentConv._id === convId) {
        setMessages(messagesCache.current[convId]);
      }

      updateConversationsList(message);

      // Notification for background chats
      if (!currentConv || currentConv._id !== convId) {
        playNotificationSound();
      }
    });


    // Typing indicators
    socketService.on("user-typing", ({ userId, conversationId, userName }) => {
      console.log("⌨️ User typing:", userName);
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: { userId, userName },
      }));
    });

    socketService.on("user-stopped-typing", ({ conversationId }) => {
      console.log("⌨️ User stopped typing");
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    });

    // Voice recording indicators
    socketService.on("user-recording-voice", ({ userId, conversationId }) => {
      setRecordingVoice((prev) => ({ ...prev, [conversationId]: userId }));
    });

    socketService.on("user-stopped-recording-voice", ({ conversationId }) => {
      setRecordingVoice((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    });

    // Message status updates
    socketService.on("message-status-updated", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
      );
    });

    socketService.on("message-read", ({ messageId, readBy, readAt }) => {
      console.log("✓ Message read:", messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "read", readAt } : msg,
        ),
      );
    });

    // Message editing
    socketService.on(
      "message-edited",
      ({ messageId, newContent, editedAt }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: newContent, edited: true, editedAt }
              : msg,
          ),
        );
      },
    );

    // Message deletion
    socketService.on("message-deleted", ({ messageId, deleteFor }) => {
      console.log("🗑️ Message deleted:", messageId);
      if (deleteFor === "everyone") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: "This message was deleted", deleted: true }
              : msg,
          ),
        );
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    });

    // Reactions
    socketService.on("reaction-added", ({ messageId, userId, emoji }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const reactions = [...(msg.reactions || [])];
            const existingIndex = reactions.findIndex(
              (r) => r.userId === userId,
            );
            if (existingIndex >= 0) {
              reactions[existingIndex] = { userId, emoji };
            } else {
              reactions.push({ userId, emoji });
            }
            return { ...msg, reactions };
          }
          return msg;
        }),
      );
    });

    socketService.on("reaction-removed", ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const reactions = (msg.reactions || []).filter(
              (r) => r.userId !== userId,
            );
            return { ...msg, reactions };
          }
          return msg;
        }),
      );
    });

    // User status changes
    socketService.on(
      "user-status-changed",
      ({ userId: changedUserId, status, lastSeen }) => {
        console.log("🟢 User status changed:", changedUserId, status);
        setOnlineUsers((prev) => ({
          ...prev,
          [changedUserId]: status === "online",
        }));

        // Update conversations list
        setConversations((prev) =>
          prev.map((conv) => {
            const participant = conv.participants?.find(
              (p) => p._id === changedUserId,
            );
            if (participant) {
              return {
                ...conv,
                participants: conv.participants.map((p) =>
                  p._id === changedUserId ? { ...p, status, lastSeen } : p,
                ),
              };
            }
            return conv;
          }),
        );
      },
    );
  }, []);

  const transformMessage = useCallback(
    (msg) => {
      return {
        id: msg._id,
        content: msg.content || "",
        sender: msg.sender._id === userId ? "user" : "other",
        timestamp: new Date(msg.createdAt),
        name: msg.sender.name,
        avatar: msg.sender.avatar,
        type: msg.type,
        mediaUrl: msg.mediaUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        duration: msg.duration,
        status: msg.status,
        deleted: msg.deleted || msg.deletedForEveryone,
        edited: msg.edited,
        editedAt: msg.editedAt,
        reactions: msg.reactions || [],
        replyTo: msg.replyTo,
        forwarded: msg.forwarded,
      };
    },
    [userId],
  );

  const fetchConversations = async () => {
    try {
      console.log("📞 Fetching conversations...");
      if (!token) return;

      const response = await api.getConversations(token);

      if (response.success) {
        console.log("✅ Got conversations:", response.data.length);
        setConversations(response.data);

        // Pre-populate online status
        response.data.forEach((conv) => {
          conv.participants?.forEach((participant) => {
            if (participant.status === "online") {
              setOnlineUsers((prev) => ({ ...prev, [participant._id]: true }));
            }
          });
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      console.log("📩 Fetching messages for:", conversationId);
      if (!token) return;

      setLoading(true);
      const response = await api.getMessages(conversationId, token);

      if (response.success) {
        const transformedMessages = response.data.map(transformMessage);
        setMessages(transformedMessages);
        messagesCache.current[conversationId] = transformedMessages;
      }
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // const sendMessage = async (content, type = "text", replyTo = null) => {
  //   if (!selectedConversation || !token) return { success: false };

  //   try {
  //     const response = await api.sendMessage(
  //       {
  //         conversationId: selectedConversation._id,
  //         content,
  //         type,
  //         replyTo,
  //       },
  //       token
  //     );

  //     if (response.success) {
  //       // Message will be added via socket event
  //       return { success: true };
  //     }
  //     return { success: false };
  //   } catch (error) {
  //     console.error("❌ Failed to send message:", error);
  //     return { success: false };
  //   }
  // };

  const sendMessage = async (content, type = "text", replyTo = null, extraData = {}) => {
    if (!selectedConversation || !token) return { success: false };

    // 🔥 optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
      type,
      replyTo,
      ...extraData,
    };

    setMessages((prev) => {
      const updated = [...prev, tempMessage];
      messagesCache.current[selectedConversation._id] = updated;
      return updated;
    });

    try {
      const response = await api.sendMessage(
        {
          conversationId: selectedConversation._id,
          content,
          type,
          replyTo,
          ...extraData,
        },
        token,
      );

      if (response.success) {
        return { success: true };
      }

      throw new Error("Send failed");
    } catch (error) {
      console.error("❌ Failed to send message:", error);

      // rollback on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
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
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to send media:", error);
      return { success: false };
    }
  };

  const createNewConversation = async (user) => {
    try {
      if (!token) return { success: false };

      const response = await api.createConversation(user._id, token);

      if (response.success) {
        const newConversation = response.data;

        const existingConv = conversations.find(
          (c) => c._id === newConversation._id,
        );

        if (!existingConv) {
          setConversations((prev) => [newConversation, ...prev]);
        }

        setSelectedConversation(newConversation);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to create conversation:", error);
      return { success: false };
    }
  };

  const createGroupConversation = async (participantIds, name) => {
    try {
      if (!token) return { success: false };
      const response = await api.createGroupConversation(participantIds, name, token);
      if (response.success) {
        const newConversation = response.data;
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to create group:", error);
      return { success: false };
    }
  };

  const addParticipant = async (userId) => {
    if (!selectedConversation || !token) return;
    await api.addParticipant(selectedConversation._id, userId, token);
  };

  const removeParticipant = async (userId) => {
    if (!selectedConversation || !token) return;
    await api.removeParticipant(selectedConversation._id, userId, token);
  };

  const leaveGroup = async () => {
    if (!selectedConversation || !token) return;
    const response = await api.leaveGroup(selectedConversation._id, token);
    if (response.success) {
      setSelectedConversation(null);
      setConversations(prev => prev.filter(c => c._id !== selectedConversation._id));
    }
  };

  const makeAdmin = async (userId) => {
    if (!selectedConversation || !token) return;
    await api.makeAdmin(selectedConversation._id, userId, token);
  };

  const removeAdmin = async (userId) => {
    if (!selectedConversation || !token) return;
    await api.removeAdmin(selectedConversation._id, userId, token);
  };

  const votePoll = async (messageId, optionIndex) => {
    if (!token) return;
    await api.votePoll(messageId, optionIndex, token);
  };

  const updateConversationsList = useCallback((message) => {
    setConversations((prev) => {
      const updated = prev.map((conv) =>
        conv._id === message.conversationId
          ? {
            ...conv,
            lastMessage: message,
            updatedAt: new Date(),
          }
          : conv,
      );
      return updated.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    });
  }, []);

  let typingTimeout;

  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;

    socketService.sendTyping(selectedConversation._id);

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socketService.sendStopTyping(selectedConversation._id);
    }, 1000);
  }, [selectedConversation]);

  const handleStopTyping = useCallback(() => {
    if (selectedConversation) {
      socketService.sendStopTyping(selectedConversation._id);
    }
  }, [selectedConversation]);

  const getConversationName = useCallback(
    (conversation) => {
      if (conversation.type === "group") {
        return conversation.groupName || "Group Chat";
      }
      const otherParticipant = conversation.participants?.find(
        (p) => p._id !== userId,
      );
      return otherParticipant?.name || "Unknown User";
    },
    [userId],
  );

  const getConversationAvatar = useCallback(
    (conversation) => {
      if (conversation.type === "group") {
        return conversation.groupAvatar || null;
      }
      const otherParticipant = conversation.participants?.find(
        (p) => p._id !== userId,
      );
      return otherParticipant?.avatar;
    },
    [userId],
  );

  const isUserOnline = useCallback(
    (conversation) => {
      if (conversation.type === "group") return true;
      const otherParticipant = conversation.participants?.find(
        (p) => p._id !== userId,
      );
      return otherParticipant && onlineUsers[otherParticipant._id];
    },
    [userId, onlineUsers],
  );

  const getLastSeen = useCallback(
    (conversation) => {
      if (conversation.type === "group") return null;
      const otherParticipant = conversation.participants?.find(
        (p) => p._id !== userId,
      );
      return otherParticipant?.lastSeen;
    },
    [userId],
  );

  const addReaction = useCallback((messageId, emoji) => {
    socketService.emit("add-reaction", { messageId, emoji });
  }, []);

  const removeReaction = useCallback((messageId) => {
    socketService.emit("remove-reaction", { messageId });
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => console.log("Could not play sound:", e));
    } catch (e) {
      console.log("Notification sound error:", e);
    }
  };

  const value = {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    typingUsers,
    onlineUsers,
    recordingVoice,
    sendMessage,
    sendMediaMessage,
    createNewConversation,
    handleTyping,
    handleStopTyping,
    fetchConversations,
    fetchMessages,
    getConversationName,
    getConversationAvatar,
    isUserOnline,
    getLastSeen,
    addReaction,
    removeReaction,
    createGroupConversation,
    addParticipant,
    removeParticipant,
    leaveGroup,
    makeAdmin,
    removeAdmin,
    votePoll,
    userId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
