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
  moreMenuRef
}) => {
  return (
    <>
      <header className="sv-chat-header-v2 md:flex hidden">
        <div className="flex items-center gap-4 w-full">
          <button onClick={() => setShowProfile(p => !p)} className="flex items-center gap-3 flex-1 min-w-0 text-left group">
            <div className="relative flex-shrink-0">
              <Avatar src={getConversationAvatar(selectedConversation)} name={getConversationName(selectedConversation)} size={12} online={isUserOnline(selectedConversation)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm tracking-tight truncate group-hover:text-sv-accent transition-colors" style={{ color: 'hsl(var(--sv-text))' }}>
                {getConversationName(selectedConversation)}
              </p>
              {isTyping ? (
                <div className="sv-header-typing-dots">
                  <span className="text-[10px] text-sv-accent font-medium">typing</span>
                  <div className="flex gap-0.5">
                    <span className="sv-typing-dot" style={{ width: 3, height: 3 }} />
                    <span className="sv-typing-dot" style={{ width: 3, height: 3, animationDelay: '0.2s' }} />
                    <span className="sv-typing-dot" style={{ width: 3, height: 3, animationDelay: '0.4s' }} />
                  </div>
                </div>
              ) : (
                <p className="text-[10px] truncate" style={{ color: 'hsl(var(--sv-text-3))' }}>
                  {isUserOnline(selectedConversation) ? "Online now" : "Last seen recently"}
                </p>
              )}
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button className="sv-icon-btn w-9 h-9 rounded-xl" onClick={() => setActiveCall({ type: "voice", otherUser: selectedConversation?.participants?.find(p => p._id !== userId) || selectedConversation })}><Phone size={18} /></button>
            <button className="sv-icon-btn w-9 h-9 rounded-xl" onClick={() => setActiveCall({ type: "video", otherUser: selectedConversation?.participants?.find(p => p._id !== userId) || selectedConversation })}><Video size={18} /></button>
             <div className="w-[1px] h-6 bg-[hsl(var(--sv-border))] mx-1" />
            <button className="sv-icon-btn w-9 h-9 rounded-xl" onClick={() => setShowInChatSearch(p => !p)}><Search size={18} /></button>
            <div className="relative" ref={moreMenuRef}>
              <button className="sv-icon-btn w-9 h-9 rounded-xl" onClick={() => setShowMoreMenu(p => !p)}><MoreVertical size={18} /></button>
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="sv-dropdown right-0 mt-2">
                    <button onClick={() => setShowProfile(true)} className="sv-dropdown-item"><Users size={16} /> View Profile</button>
                    <button onClick={() => setShowBgPicker(true)} className="sv-dropdown-item"><ImageIcon size={16} /> Change Wallpaper</button>
                     <div className="h-px bg-[hsl(var(--sv-border))] my-1" />
                    <button onClick={() => setShowClearConfirm(true)} className="sv-dropdown-item danger"><Trash2 size={16} /> Clear Chat</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sv-chat-header-dark">
        <div className="flex items-center gap-4 w-full">
          <button className="text-white" onClick={() => setMobileShowSidebar(true)}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <Avatar src={getConversationAvatar(selectedConversation)} name={getConversationName(selectedConversation)} size={11} />
            <div className="flex-1 min-w-0 ml-3">
              <p className="font-bold text-base truncate">{getConversationName(selectedConversation)}</p>
              <p className="text-[11px] text-white/60">Online</p>
            </div>
          </button>
          <button className="text-white" onClick={() => setShowMoreMenu(p => !p)}><MoreVertical size={20} /></button>
        </div>
      </header>
    </>
  );
};

export default ChatHeader;
