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
import { deriveSharedSecret, encryptMessage, decryptMessage } from "../utils/crypto";
import { useNotifications } from "../components/NotificationProvider";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children, token, userId }) => {
  const { addNotification } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  // onlineUsers: { [userId]: { online: boolean, lastSeen: Date|null } }
  const [onlineUsers, setOnlineUsers] = useState({});
  const [recordingVoice, setRecordingVoice] = useState({});
  const [notification, setNotification] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [groupInvite, setGroupInvite] = useState(null); // pending group invite
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [conversationWallpapers, setConversationWallpapers] = useState(() => {
    const saved = localStorage.getItem("conversationWallpapers");
    return saved ? JSON.parse(saved) : {};
  });

  const selectedConversationRef = useRef(null);
  const prevConversationRef = useRef(null);
  const messagesCache = useRef({});
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const sharedKeys = useRef({}); // { otherParticipantId: cryptoKey }

  // Helper: Play Notification Sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((e) => console.log("Could not play sound:", e));
    } catch (e) {
      console.log("Notification sound error:", e);
    }
  }, []);

  // Helper: Show Browser Notification
  const showNotification = useCallback((message) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const notification = new Notification(`New message from ${message.sender.name}`, {
        body: message.content,
        icon: message.sender.avatar || "/icon-192.png",
      });

      notification.onclick = () => {
        window.focus();
        // You could also set the selected conversation here if you have access to it
      };
    }
  }, []);

  // Helper: Update Conversations List
  const updateConversationsList = useCallback((message) => {
    setConversations((prev) => {
      const currentConv = selectedConversationRef.current;
      const conversationId = message.conversationId?._id || message.conversationId;

      let found = false;
      const updated = prev.map((conv) => {
        if (conv._id === conversationId) {
          found = true;
          const isBackground = !currentConv || currentConv._id !== conversationId;
          const isMessageFromOther = message.sender?._id ? message.sender._id !== userId : message.sender !== 'user';

          if (isBackground && isMessageFromOther) {
            addNotification({
              title: message.sender.name || "New Message",
              message: message.content || (message.type !== 'text' ? `Sent a ${message.type}` : ""),
              avatar: message.sender.avatar,
              type: 'message',
              onClick: () => {
                // Focus conversation logic if possible
                setSelectedConversation(conv);
              }
            });
          }

          return {
            ...conv,
            lastMessage: message,
            updatedAt: new Date(message.createdAt || Date.now()),
            unreadCount: (isBackground && isMessageFromOther)
              ? { ...(conv.unreadCount || {}), [userId]: (conv.unreadCount?.[userId] || 0) + 1 }
              : { ...(conv.unreadCount || {}), [userId]: 0 }
          };
        }
        return conv;
      });

      // If it's a new conversation not in list yet, we'll wait for the "joined-group" or "new-conversation" event
      // but for reordering existing ones:
      return updated.sort((a, b) => {
        const aPinned = a.pinnedBy?.some(id => (id._id || id) === userId);
        const bPinned = b.pinnedBy?.some(id => (id._id || id) === userId);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    });
  }, [userId, addNotification]);

  // Helper: Transform Message
  const transformMessage = useCallback(
    (msg) => {
      return {
        id: msg._id,
        content: msg.content || "",
        sender: msg.sender._id === userId ? "user" : "other",
        senderId: msg.sender._id,
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
        isEncrypted: msg.isEncrypted,
        unlockAt: msg.unlockAt,
        unlockConditions: msg.unlockConditions,
      };
    },
    [userId],
  );

  const decryptMessageContent = useCallback(async (msg, conv) => {
    if (!msg.isEncrypted || !msg.content || !conv || conv.type !== 'one-on-one') return msg.content;

    const otherParticipant = conv.participants?.find(p => p._id !== userId);
    if (!otherParticipant || !otherParticipant.settings?.publicKey) {
      // Fallback: search for the sender's public key if it's not the current user
      const sender = typeof msg.sender === 'object' ? msg.sender : { _id: msg.sender };
      if (sender._id === userId) {
        // Find whoever the OTHER person is in this private chat
        const recipient = conv.participants?.find(p => p._id !== userId);
        if (!recipient?.settings?.publicKey) return msg.content;
      }
    }

    const partner = conv.participants?.find(p => p._id !== userId);
    if (!partner?.settings?.publicKey) return msg.content;

    try {
      let sharedKey = sharedKeys.current[partner._id];
      if (!sharedKey) {
        const otherPubKeyJwk = JSON.parse(partner.settings.publicKey);
        sharedKey = await deriveSharedSecret(otherPubKeyJwk);
        sharedKeys.current[partner._id] = sharedKey;
      }

      const encryptedData = JSON.parse(msg.content);
      return await decryptMessage(encryptedData, sharedKey);
    } catch (err) {
      return "[Unable to decrypt]";
    }
  }, [userId]);

  // Socket Listener Setup
  const setupSocketListeners = useCallback(() => {
    console.log("🎧 Setting up socket listeners...");

    socketService.on("message-received", async (message) => {
      const convId = message.conversationId;
      const currentConv = selectedConversationRef.current;

      // Decrypt if necessary
      if (message.isEncrypted && (currentConv?._id === convId || conversations.find(c => c._id === convId))) {
        const targetConv = currentConv?._id === convId ? currentConv : conversations.find(c => c._id === convId);
        message.content = await decryptMessageContent(message, targetConv);
      }

      const transformedMessage = transformMessage(message);

      const updateMessages = (prev) => {
        // Look for matching temp message (sending status, same content, same sender)
        const tempIndex = prev.findIndex(m =>
          m.status === 'sending' &&
          m.content === transformedMessage.content &&
          m.sender === 'user'
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = transformedMessage;
          return updated;
        }

        // Avoid adding if ID already exists (e.g. from API response race)
        if (prev.some(m => m.id === transformedMessage.id)) return prev;

        return [...prev, transformedMessage];
      };

      // Update Cache
      messagesCache.current[convId] = updateMessages(messagesCache.current[convId] || []);

      // Only update UI if this conversation is open
      if (currentConv && currentConv._id === convId) {
        setMessages(messagesCache.current[convId]);

        // Auto-mark as read if conversation is open
        if (transformedMessage.sender !== 'user') {
          socketService.emit("mark-messages-read", {
            conversationId: convId,
          });

          // Locally reset unread count for this conversation since it's open
          setConversations(prev => prev.map(c =>
            c._id === convId ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } } : c
          ));
        }
      }

      updateConversationsList(message);

      // Notification for background chats
      if (!currentConv || currentConv._id !== convId || document.hidden) {
        playNotificationSound();
        showNotification(message);
        setNotification(message);
        setTimeout(() => setNotification(null), 5000);
      }
    });

    socketService.on("user-typing", ({ userId, conversationId, userName }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: { userId, userName },
      }));
    });

    socketService.on("user-stopped-typing", ({ conversationId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    });

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

    socketService.on("task-reminder", (data) => {
      setNotification({ content: data.message, sender: { name: "Reminder" } });
      setTimeout(() => setNotification(null), 8000);
      playNotificationSound();
    });

    socketService.on("message-status-updated", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
      );
    });

    socketService.on("message-read", ({ messageId, readBy, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "read", readAt } : msg,
        ),
      );
    });

    socketService.on("unread-count-reset", ({ conversationId }) => {
      setConversations(prev => prev.map(c =>
        c._id === conversationId ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } } : c
      ));
    });

    socketService.on("message-edited", ({ messageId, newContent, editedAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, edited: true, editedAt }
            : msg,
        ),
      );
    });

    socketService.on("message-deleted", ({ messageId, deleteFor }) => {
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

    socketService.on("poll-updated", ({ messageId, pollOptions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, pollOptions } : msg
        )
      );
    });

    socketService.on("mentioned-in-message", ({ messageId, conversationId, sender }) => {
      // Optional: Highlight message or show specific mention toast
      console.log("You were mentioned!", messageId);
    });

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

    socketService.on("status-updated", () => {
      fetchStatuses();
    });

    socketService.on("user-status-changed", ({ userId: changedUserId, status, lastSeen }) => {
      const isOnline = status === "online";
      const seenAt = lastSeen ? new Date(lastSeen) : new Date();

      // Update real-time online status map with BOTH online flag and lastSeen
      setOnlineUsers((prev) => ({
        ...prev,
        [changedUserId]: { online: isOnline, lastSeen: seenAt },
      }));

      setConversations((prev) =>
        prev.map((conv) => {
          const participant = conv.participants?.find(
            (p) => p._id === changedUserId,
          );
          if (participant) {
            return {
              ...conv,
              participants: conv.participants.map((p) =>
                p._id === changedUserId ? { ...p, status, lastSeen: seenAt } : p,
              ),
            };
          }
          return conv;
        }),
      );

      // Update selected conversation if it matches
      setSelectedConversation(prev => {
        if (prev && prev.participants?.some(p => p._id === changedUserId)) {
          return {
            ...prev,
            participants: prev.participants.map(p =>
              p._id === changedUserId ? { ...p, status, lastSeen: seenAt } : p
            )
          };
        }
        return prev;
      });
    });

    socketService.on("incoming-call", (callData) => {
      setIncomingCall(callData);
      playNotificationSound();
    });

    // Group invite received
    socketService.on("group-invite", (inviteData) => {
      setGroupInvite(inviteData);
      playNotificationSound();
    });

    // User accepted invite → add group to their sidebar
    socketService.on("joined-group", ({ conversation }) => {
      setConversations((prev) => {
        if (prev.some((c) => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    });

    // Group info was updated by admin
    socketService.on("group-updated", ({ conversationId, groupName, groupAvatar, groupDescription }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, groupName, groupAvatar, groupDescription }
            : c
        )
      );
      setSelectedConversation((prev) =>
        prev && prev._id === conversationId
          ? { ...prev, groupName, groupAvatar, groupDescription }
          : prev
      );
    });

    // A new member joined the group
    socketService.on("member-joined", ({ conversation }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? conversation : c))
      );
      setSelectedConversation((prev) =>
        prev && prev._id === conversation._id ? conversation : prev
      );
    });

    // NOTE: call-ended and call-rejected are handled inside CallInterface
    // to avoid conflicting state resets that would close the active call screen.
  }, [transformMessage, updateConversationsList, playNotificationSound]);

  // Effect: Sync Refs
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Effect: Request Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Effect: Connect Socket
  useEffect(() => {
    if (token && userId) {
      console.log("🚀 Initializing socket connection...");
      socketService.connect(token);
      socketService.emit("setup", userId);
      fetchConversations();
      fetchTasks();
      fetchStatuses();
    }

    return () => {
      console.log("🧹 Disconnecting socket...");
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [token, userId]);

  // Effect: Setup Listeners
  useEffect(() => {
    if (!token || !userId) return;

    setupSocketListeners();

    return () => {
      socketService.removeAllListeners();
    };
  }, [token, userId, setupSocketListeners]);

  // Effect: Handle Conversation Change
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;

    if (!selectedConversation) return;

    if (prevConversationRef.current) {
      socketService.leaveConversation(prevConversationRef.current);
    }

    socketService.joinConversation(selectedConversation._id);
    prevConversationRef.current = selectedConversation._id;

    if (messagesCache.current[selectedConversation._id]) {
      setMessages(messagesCache.current[selectedConversation._id]);
    } else {
      fetchMessages(selectedConversation._id);
    }

    socketService.emit("mark-messages-read", {
      conversationId: selectedConversation._id,
    });

    // Locally reset unread count
    setConversations(prev => prev.map(c =>
      c._id === selectedConversation._id ? { ...c, unreadCount: { ...c.unreadCount, [userId]: 0 } } : c
    ));
  }, [selectedConversation, userId]);

  // API Actions
  const fetchConversations = async () => {
    try {
      if (!token) return;
      const response = await api.getConversations(token);
      if (response.success) {
        setConversations(response.data);
        // Seed the onlineUsers map with real status + lastSeen from DB
        const initialStatus = {};
        response.data.forEach((conv) => {
          conv.participants?.forEach((participant) => {
            if (participant._id && !initialStatus[participant._id]) {
              initialStatus[participant._id] = {
                online: participant.status === "online",
                lastSeen: participant.lastSeen ? new Date(participant.lastSeen) : null,
              };
            }
          });
        });
        setOnlineUsers(initialStatus);
      }
    } catch (error) {
      console.error("❌ Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      if (!token) return;
      setLoading(true);
      const response = await api.getMessages(conversationId, token);
      if (response.success) {
        const rawMessages = response.data;
        const targetConv = conversations.find(c => c._id === conversationId) || selectedConversation;

        // Decrypt messages in bulk
        const decryptedMessages = await Promise.all(rawMessages.map(async (m) => {
          if (m.isEncrypted) {
            m.content = await decryptMessageContent(m, targetConv);
          }
          return m;
        }));

        const transformedMessages = decryptedMessages.map(transformMessage);
        setMessages(transformedMessages);
        messagesCache.current[conversationId] = transformedMessages;
      }
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content, type = "text", replyTo = null, extraData = {}) => {
    if (!selectedConversation || !token) return { success: false };

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
      let finalContent = content;
      let isEncrypted = false;

      // Encrypt if it's a 1-on-1 chat
      if (selectedConversation.type === 'one-on-one' && type === 'text') {
        const otherParticipant = selectedConversation.participants?.find(p => p._id !== userId);
        if (otherParticipant?.settings?.publicKey) {
          try {
            let sharedKey = sharedKeys.current[otherParticipant._id];
            if (!sharedKey) {
              const otherPubKeyJwk = JSON.parse(otherParticipant.settings.publicKey);
              sharedKey = await deriveSharedSecret(otherPubKeyJwk);
              sharedKeys.current[otherParticipant._id] = sharedKey;
            }
            const encryptedData = await encryptMessage(content, sharedKey);
            finalContent = JSON.stringify(encryptedData);
            isEncrypted = true;
          } catch (err) {
            console.error("Encryption failed, sending as plain text:", err);
          }
        }
      }

      const response = await api.sendMessage(
        {
          conversationId: selectedConversation._id,
          content: finalContent,
          type,
          replyTo,
          isEncrypted,
          ...extraData,
        },
        token,
      );
      if (response.success) return { success: true };
      throw new Error("Send failed");
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      return { success: false };
    }
  };

  const sendMediaMessage = async (file, type, extraData = {}) => {
    if (!selectedConversation || !token) return { success: false };
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("conversationId", selectedConversation._id);
      formData.append("type", type);

      // Add extra data (like unlockAt) to formData
      Object.keys(extraData).forEach(key => {
        if (extraData[key]) formData.append(key, extraData[key]);
      });

      const response = await api.uploadMedia(formData, token);
      return { success: response.success };
    } catch (error) {
      return { success: false };
    }
  };

  const createNewConversation = async (user) => {
    try {
      if (!token) return { success: false };
      const response = await api.createConversation(user._id, token);
      if (response.success) {
        const newConv = response.data;
        if (!conversations.find((c) => c._id === newConv._id)) {
          setConversations((prev) => [newConv, ...prev]);
        }
        setSelectedConversation(newConv);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const createGroupConversation = async (participantIds, name) => {
    try {
      if (!token) return { success: false };
      // Create group with only self as participant; invites sent separately
      const response = await api.createGroupConversation(participantIds, name, token);
      if (response.success) {
        const newConversation = response.data;
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        // Now send invites to each selected participant
        for (const pid of participantIds) {
          await api.sendGroupInvite(newConversation._id, pid, token);
        }
        return { success: true, conversation: newConversation };
      }
      return { success: false, error: response.message };
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

  const updateGroupInfo = async (conversationId, data) => {
    if (!token) return { success: false };
    const response = await api.updateGroupInfo(conversationId, data, token);
    if (response.success) {
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? response.data : c))
      );
      setSelectedConversation((prev) =>
        prev && prev._id === conversationId ? response.data : prev
      );
    }
    return response;
  };

  const respondGroupInvite = async (conversationId, accept) => {
    if (!token) return { success: false };
    const response = await api.respondGroupInvite(conversationId, accept, token);
    setGroupInvite(null);
    return response;
  };

  const votePoll = async (messageId, optionIndex) => {
    if (!token) return;
    await api.votePoll(messageId, optionIndex, token);
  };

  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketService.sendTyping(selectedConversation._id);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendStopTyping(selectedConversation._id);
      isTypingRef.current = false;
    }, 3000);
  }, [selectedConversation]);

  const handleStopTyping = useCallback(() => {
    if (selectedConversation) {
      socketService.sendStopTyping(selectedConversation._id);
      isTypingRef.current = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [selectedConversation]);

  const getConversationName = useCallback((conversation) => {
    if (conversation.type === "group") return conversation.groupName || "Group Chat";
    const other = conversation.participants?.find((p) => p._id !== userId);
    return other?.name || "Unknown User";
  }, [userId]);

  const getConversationAvatar = useCallback((conversation) => {
    if (conversation.type === "group") return conversation.groupAvatar || null;
    const other = conversation.participants?.find((p) => p._id !== userId);
    return other?.avatar;
  }, [userId]);

  const isUserOnline = useCallback((conversation) => {
    if (conversation.type === "group") return false;
    const other = conversation.participants?.find((p) => p._id !== userId);
    if (!other) return false;
    // Prefer real-time socket data, fall back to participant data from DB
    const rtStatus = onlineUsers[other._id];
    if (rtStatus !== undefined) return rtStatus.online === true;
    return other.status === "online";
  }, [userId, onlineUsers]);

  const getLastSeen = useCallback((conversation) => {
    if (conversation.type === "group") return null;
    const other = conversation.participants?.find((p) => p._id !== userId);
    if (!other) return null;
    // Prefer real-time socket data, fall back to participant data from DB
    const rtStatus = onlineUsers[other._id];
    if (rtStatus !== undefined) return rtStatus.lastSeen || other?.lastSeen || null;
    return other?.lastSeen || null;
  }, [userId, onlineUsers]);

  const addReaction = useCallback((messageId, emoji) => {
    socketService.emit("add-reaction", { messageId, emoji });
  }, []);

  const removeReaction = useCallback((messageId) => {
    socketService.emit("remove-reaction", { messageId });
  }, []);

  const setConversationWallpaper = useCallback((conversationId, wallpaper) => {
    setConversationWallpapers((prev) => {
      const updated = { ...prev, [conversationId]: wallpaper };
      localStorage.setItem("conversationWallpapers", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteMessage = useCallback(async (messageId, deleteFor = 'me') => {
    if (!token) return { success: false };
    try {
      const response = await api.deleteMessage(messageId, deleteFor, token);
      if (response.success) {
        if (deleteFor === 'me') {
          // Immediately hide locally for "Delete for me"
          setMessages(prev => prev.filter(m => m.id !== messageId));
        }
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to delete message:", error);
      return { success: false };
    }
  }, [token]);

  const syncContacts = useCallback(async (contacts) => {
    if (!token) return { success: false };
    try {
      const response = await api.syncContacts(contacts, token);
      if (response.success) {
        // Refresh user data if needed or just return success
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to sync contacts:", error);
      return { success: false };
    }
  }, [token]);

  const clearChat = useCallback(async (conversationId) => {
    if (!token) return { success: false };
    try {
      const response = await api.clearChat(conversationId, token);
      if (response.success) {
        setMessages([]);
        messagesCache.current[conversationId] = [];
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to clear chat:", error);
      return { success: false };
    }
  }, [token]);

  const editMessage = useCallback(async (messageId, newContent) => {
    if (!token) return { success: false };
    try {
      const response = await api.editMessage(messageId, newContent, token);
      if (response.success) {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, content: newContent, edited: true } : m
        ));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to edit message:", error);
      return { success: false };
    }
  }, [token]);

  const forwardMessage = useCallback(async (messageId, conversationIds) => {
    if (!token) return { success: false };
    try {
      const response = await api.forwardMessage(messageId, conversationIds, token);
      return { success: response.success };
    } catch (error) {
      console.error("❌ Failed to forward message:", error);
      return { success: false };
    }
  }, [token]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getTasks(token);
      if (res.success) setTasks(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch tasks:", error);
    }
  }, [token]);

  const addTask = useCallback(async (taskData) => {
    if (!token) return { success: false };
    try {
      const res = await api.createTask(taskData, token);
      if (res.success) {
        setTasks(prev => [res.data, ...prev]);
        return { success: true, data: res.data };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to add task:", error);
      return { success: false };
    }
  }, [token]);

  const toggleTaskStatus = useCallback(async (taskId, completed) => {
    if (!token) return { success: false };
    try {
      const res = await api.updateTask(taskId, { status: completed ? 'completed' : 'pending' }, token);
      if (res.success) {
        setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to toggle task:", error);
      return { success: false };
    }
  }, [token]);

  const removeTask = useCallback(async (taskId) => {
    if (!token) return { success: false };
    try {
      const res = await api.deleteTask(taskId, token);
      if (res.success) {
        setTasks(prev => prev.filter(t => t._id !== taskId));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("❌ Failed to remove task:", error);
      return { success: false };
    }
  }, [token]);

  const togglePin = useCallback(async (conversationId) => {
    if (!token) return { success: false };
    try {
      const res = await api.togglePin(conversationId, token);
      if (res.success) {
        setConversations(prev => {
          const updated = prev.map(c => c._id === conversationId ? { ...c, pinnedBy: res.data.pinnedBy } : c);
          return updated.sort((a, b) => {
            const aPinned = a.pinnedBy?.some(id => id === userId || id._id === userId);
            const bPinned = b.pinnedBy?.some(id => id === userId || id._id === userId);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
        });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }, [token, userId]);

  const toggleArchive = useCallback(async (conversationId) => {
    if (!token) return { success: false };
    try {
      const res = await api.toggleArchive(conversationId, token);
      if (res.success) {
        setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, archivedBy: res.data.archivedBy } : c));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }, [token]);

  const searchMessages = useCallback(async (query, conversationId = null) => {
    if (!token) return { success: false };
    try {
      const res = await api.searchMessages(query, token, conversationId);
      return res;
    } catch (error) {
      return { success: false };
    }
  }, [token]);

  const getConversationMedia = useCallback(async (conversationId, type) => {
    if (!token) return { success: false };
    try {
      const res = await api.getConversationMedia(conversationId, type, token);
      return res;
    } catch (error) {
      return { success: false };
    }
  }, [token]);

  const fetchStatuses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.getStatuses(token);
      if (res.success) setStatuses(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const addStatus = useCallback(async (data) => {
    if (!token) return { success: false };
    try {
      const res = await api.createStatus(data, token);
      if (res.success) {
        setStatuses(prev => {
          const userStatus = prev.find(s => s.user._id === userId);
          if (userStatus) {
            return prev.map(s => s.user._id === userId ? { ...s, items: [res.data, ...s.items] } : s);
          }
          return [{ user: res.data.user, items: [res.data] }, ...prev];
        });
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false };
    }
  }, [token, userId]);

  const setStatusSeen = useCallback(async (statusId) => {
    if (!token) return;
    try {
      await api.markStatusSeen(statusId, token);
      // Optional: Local update
    } catch (err) { }
  }, [token]);

  const removeStatus = useCallback(async (statusId) => {
    if (!token) return;
    try {
      const res = await api.deleteStatus(statusId, token);
      if (res.success) {
        setStatuses(prev => prev.map(group => ({
          ...group,
          items: group.items.filter(item => item._id !== statusId)
        })).filter(group => group.items.length > 0));
      }
    } catch (err) { }
  }, [token]);

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
    editMessage,
    forwardMessage,
    createNewConversation,
    deleteMessage,
    clearChat,
    syncContacts,
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
    notification,
    setNotification,
    userId,
    conversationWallpapers,
    setConversationWallpaper,
    incomingCall,
    setIncomingCall,
    activeCall,
    setActiveCall,
    groupInvite,
    setGroupInvite,
    updateGroupInfo,
    respondGroupInvite,
    tasks,
    fetchTasks,
    addTask,
    toggleTaskStatus,
    removeTask,
    togglePin,
    toggleArchive,
    searchMessages,
    getConversationMedia,
    statuses,
    fetchStatuses,
    addStatus,
    setStatusSeen,
    removeStatus,
    updateEphemeralSettings: (id, data) => api.updateEphemeralSettings(id, data, token),
    markAsRead: (id) => api.markAsRead(id, token),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
