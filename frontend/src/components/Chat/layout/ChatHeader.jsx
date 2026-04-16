import React, { useRef } from "react";
import { Phone, Video, Search, MoreVertical, ChevronLeft, Users, ImageIcon, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../Avatar";

const ChatHeader = ({
  selectedConversation,
  getConversationName,
  getConversationAvatar,
  isUserOnline,
  isTyping,
  typingUsers,
  setMobileShowSidebar,
  setShowProfile,
  setActiveCall,
  userId,
  setShowInChatSearch,
  showInChatSearch,
  setShowMoreMenu,
  showMoreMenu,
  setShowBgPicker,
  setShowClearConfirm,
  moreMenuRef,
  getLastSeen,
  fmtLastSeen,
}) => {
  const convName = getConversationName(selectedConversation);
  const convAvatar = getConversationAvatar(selectedConversation);
  const online = isUserOnline(selectedConversation);
  const isGroup = selectedConversation?.isGroup;
  const memberCount = selectedConversation?.participants?.length || 0;
  const onlineCount = selectedConversation?.participants?.filter(p =>
    p._id !== userId && isUserOnline({ participants: [p] })
  ).length || 0;

  const lastSeenTs = getLastSeen ? getLastSeen(selectedConversation) : null;
  const statusText = isTyping
    ? null
    : isGroup
      ? `${memberCount} member${memberCount !== 1 ? 's' : ''}${onlineCount > 0 ? `, ${onlineCount} online` : ''}`
      : online
        ? "Online now"
        : (fmtLastSeen && lastSeenTs ? fmtLastSeen(lastSeenTs) : "Last seen recently");

  return (
    <>
      {/* Desktop Header */}
      <header className="sv-chat-header-v2 md:flex hidden flex-shrink-0">
        <div className="flex items-center gap-4 w-full px-6" style={{ height: 72 }}>
          <button onClick={() => setShowProfile(p => !p)} className="flex items-center gap-3 flex-1 min-w-0 text-left group">
            <div className="relative flex-shrink-0">
              <Avatar src={convAvatar} name={convName} size={11} online={online && !isGroup} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] tracking-tight truncate group-hover:text-sv-accent transition-colors" style={{ color: 'hsl(var(--sv-text))' }}>
                {convName}
              </p>
              {isTyping ? (
                <div className="sv-header-typing-dots">
                  <span className="text-[11px] font-semibold" style={{ color: 'hsl(var(--sv-accent))' }}>typing</span>
                  <div className="flex gap-0.5 ml-1">
                    <span className="sv-typing-dot" style={{ width: 3, height: 3 }} />
                    <span className="sv-typing-dot" style={{ width: 3, height: 3, animationDelay: '0.2s' }} />
                    <span className="sv-typing-dot" style={{ width: 3, height: 3, animationDelay: '0.4s' }} />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] truncate font-medium" style={{ color: online && !isGroup ? 'hsl(var(--sv-online))' : 'hsl(var(--sv-text-3))' }}>
                  {statusText}
                </p>
              )}
            </div>
          </button>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              className="sv-icon-btn w-9 h-9 rounded-xl"
              onClick={() => setActiveCall({ type: "voice", otherUser: selectedConversation?.participants?.find(p => p._id !== userId) || selectedConversation })}
              title="Voice call"
            >
              <Phone size={18} />
            </button>
            <button
              className="sv-icon-btn w-9 h-9 rounded-xl"
              onClick={() => setActiveCall({ type: "video", otherUser: selectedConversation?.participants?.find(p => p._id !== userId) || selectedConversation })}
              title="Video call"
            >
              <Video size={18} />
            </button>
            <div className="w-[1px] h-5 mx-1" style={{ background: 'hsl(var(--sv-border))' }} />
            <button className="sv-icon-btn w-9 h-9 rounded-xl" onClick={() => setShowInChatSearch(p => !p)} title="Search">
              <Search size={18} />
            </button>
            <div className="relative" ref={moreMenuRef}>
              <button className="sv-icon-btn w-9 h-9 rounded-xl" onClick={() => setShowMoreMenu(p => !p)} title="More options">
                <MoreVertical size={18} />
              </button>
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="sv-dropdown right-0 mt-2"
                  >
                    <button onClick={() => setShowProfile(true)} className="sv-dropdown-item"><Users size={16} /> View Profile</button>
                    <button onClick={() => setShowBgPicker(true)} className="sv-dropdown-item"><ImageIcon size={16} /> Change Wallpaper</button>
                    <div className="h-px my-1" style={{ background: 'hsl(var(--sv-border))' }} />
                    <button onClick={() => setShowClearConfirm(true)} className="sv-dropdown-item danger"><Trash2 size={16} /> Clear Chat</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sv-chat-header-dark flex-shrink-0">
        <div className="flex items-center gap-3 w-full">
          <button className="text-white flex-shrink-0" onClick={() => setMobileShowSidebar(true)}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <Avatar src={convAvatar} name={convName} size={10} />
            <div className="flex-1 min-w-0 ml-1">
              <p className="font-bold text-base truncate text-white">{convName}</p>
              <p className="text-[11px] text-white/60">
                {isTyping ? "typing..." : online ? "Online" : "Offline"}
              </p>
            </div>
          </button>
          <button className="text-white flex-shrink-0" onClick={() => setShowMoreMenu(p => !p)}>
            <MoreVertical size={20} />
          </button>
        </div>
      </header>
    </>
  );
};

export default ChatHeader;
