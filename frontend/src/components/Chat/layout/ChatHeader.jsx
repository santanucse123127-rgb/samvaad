import React, { useRef } from "react";
import { Phone, Video, Search, MoreVertical, ChevronLeft, Users, ImageIcon, Trash2, Bell, Star } from "lucide-react";
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
      <header
        className="md:flex hidden flex-shrink-0 z-20 border-b items-center"
        style={{
          background: 'hsl(var(--sv-surface-2))',
          borderColor: 'hsl(var(--sv-border))',
          height: 64,
          paddingLeft: 20,
          paddingRight: 16,
        }}
      >
        {/* Avatar + Name */}
        <button
          onClick={() => setShowProfile(p => !p)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden">
              {convAvatar
                ? <img src={convAvatar} alt={convName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                    {convName?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
            {online && !isGroup && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2"
                style={{ borderColor: 'hsl(var(--sv-surface-2))' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate group-hover:opacity-80 transition-opacity"
              style={{ color: 'hsl(var(--sv-text))' }}>
              {convName}
            </p>
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.div key="typing" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="flex items-center gap-1">
                  <span className="text-xs font-semibold" style={{ color: '#10b981' }}>typing</span>
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce inline-block"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </motion.div>
              ) : (
                <motion.p key="status" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="text-xs truncate font-medium"
                  style={{ color: online && !isGroup ? '#10b981' : 'hsl(var(--sv-text-3))' }}>
                  {statusText}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </button>

        {/* Group participant avatars */}
        {isGroup && (
          <div className="flex items-center mr-4 flex-shrink-0">
            {selectedConversation.participants?.slice(0, 3).map((p, i) => (
              <div key={p._id} className="w-7 h-7 rounded-full border-2 overflow-hidden"
                style={{ marginLeft: i === 0 ? 0 : -8, borderColor: 'hsl(var(--sv-surface-2))', zIndex: 3 - i }}>
                {p.avatar
                  ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                      {p.name?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
            ))}
            {memberCount > 3 && (
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white -ml-2"
                style={{ borderColor: 'hsl(var(--sv-surface-2))', background: 'hsl(var(--sv-surface-3))' }}>
                +{memberCount - 3}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <HeaderBtn onClick={() => setShowInChatSearch(p => !p)} title="Search messages" active={showInChatSearch}>
            <Search size={17} />
          </HeaderBtn>
          {!isGroup && (
            <HeaderBtn
              onClick={() => setActiveCall({ conversationId: selectedConversation._id, type: 'voice', isInitiator: true })}
              title="Voice call"
            >
              <Phone size={17} />
            </HeaderBtn>
          )}
          <div ref={moreMenuRef} className="relative">
            <HeaderBtn onClick={() => setShowMoreMenu(p => !p)} title="More options" active={showMoreMenu}>
              <MoreVertical size={17} />
            </HeaderBtn>
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[180px]"
                  style={{ background: 'hsl(var(--sv-surface-3))', border: '1px solid hsl(var(--sv-border))' }}
                >
                  {[
                    { label: 'Search in chat', icon: <Search size={14} />, action: () => { setShowInChatSearch(true); setShowMoreMenu(false); } },
                    { label: 'Change wallpaper', icon: <ImageIcon size={14} />, action: () => { setShowBgPicker(true); setShowMoreMenu(false); } },
                    { label: 'Clear chat', icon: <Trash2 size={14} />, action: () => { setShowClearConfirm(true); setShowMoreMenu(false); }, danger: true },
                  ].map(item => (
                    <button key={item.label} onClick={item.action}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium transition-colors text-left hover:bg-white/5"
                      style={{ color: item.danger ? 'hsl(var(--sv-danger))' : 'hsl(var(--sv-text-2))' }}>
                      {item.icon}{item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              {convAvatar
                ? <img src={convAvatar} alt={convName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                    {convName?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
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

const HeaderBtn = ({ children, onClick, title, active }) => (
  <button
    onClick={onClick}
    title={title}
    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
    style={{
      background: active ? 'hsl(var(--sv-accent)/0.15)' : 'transparent',
      color: active ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-text-3))',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'hsl(var(--sv-surface-3))'; e.currentTarget.style.color = 'hsl(var(--sv-text))'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(var(--sv-text-3))'; } }}
  >
    {children}
  </button>
);

export default React.memo(ChatHeader);
