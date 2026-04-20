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
      <header className="md:flex hidden flex-shrink-0 z-20 border-b border-black/5" style={{ background: 'hsl(var(--sv-surface))' }}>
        <div className="flex items-center gap-4 w-full px-6" style={{ height: 72 }}>
          <button onClick={() => setShowProfile(p => !p)} className="flex items-center gap-3 flex-1 min-w-0 text-left group">
            <div className="relative flex-shrink-0">
              <Avatar src={convAvatar} name={convName} size={11} online={online && !isGroup} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <p className="font-bold text-[20px] tracking-tight truncate group-hover:text-black transition-colors text-black font-outfit">
                  {convName}
                </p>
              </div>
              <p className="text-[13px] truncate font-medium text-black/50">
                {statusText}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isGroup && (
               <div className="flex items-center mr-4">
                   {selectedConversation.participants?.slice(0,3).map((p,i) => (
                      <div key={p._id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden -ml-2 first:ml-0 shadow-lg">
                          <img src={p.avatar || '/default-avatar.png'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                   ))}
                   <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden -ml-2 bg-black/5 flex items-center justify-center text-xs font-bold text-black shadow-lg cursor-pointer hover:bg-black/10 transition-colors">
                     +
                   </div>
               </div>
            )}
           
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

export default React.memo(ChatHeader);
