import React from "react";
import { 
  Plus, Search, MoreVertical, Archive, MessageSquare, PhoneCall, 
  Users, Megaphone, ImageIcon, ChevronRight, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../Avatar";
import StatusPanel from "../StatusPanel";
import SettingsSidebarPanel from "../SettingsSidebarPanel";
import ProfileSidebarPanel from "../ProfileSidebarPanel";
import ClipboardSync from "../ClipboardSync";

const ChatSidebar = ({
  user,
  activeRailTab,
  showArchivedOnly,
  setShowArchivedOnly,
  searchQuery,
  setSearchQuery,
  isSearchingGlobal,
  globalSearchMessages,
  conversations,
  setSelectedConversation,
  setMobileShowSidebar,
  loading,
  filteredConversations,
  getConversationName,
  getConversationAvatar,
  isUserOnline,
  userId,
  selectedConversation,
  typingUsers,
  fmtTime,
  fmtDate,
  togglePin,
  toggleArchive,
  setShowNewChatModal,
  mobileShowSidebar,
  setActiveRailTab,
  setActiveCall,
  messages = []
}) => {
  const sidebarTitle = activeRailTab === 'chats' ? (showArchivedOnly ? 'Archived' : 'Messages')
    : activeRailTab === 'calls' ? 'Calls'
    : activeRailTab === 'status' ? 'Status'
    : activeRailTab === 'channels' ? 'Channels'
    : activeRailTab === 'groups' ? 'Groups'
    : activeRailTab === 'clipboard' ? 'Clipboard'
    : activeRailTab === 'gallery' ? 'Gallery'
    : activeRailTab === 'settings' ? 'Settings'
    : activeRailTab === 'profile' ? 'Profile' : 'App';

  return (
    <aside
      className={`flex flex-col h-full z-30 transition-all duration-300
        fixed md:relative inset-y-0 left-0
        w-full md:w-full pb-[72px] md:pb-0
        ${mobileShowSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      style={{ background: 'hsl(var(--sv-surface))' }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold tracking-tight" style={{ color: 'hsl(var(--sv-text))' }}>
          {sidebarTitle}
        </h2>
        <div className="flex items-center gap-1.5">
          {activeRailTab === 'chats' && (
            <button
              onClick={() => setShowArchivedOnly(p => !p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: showArchivedOnly ? 'hsl(var(--sv-accent)/0.15)' : 'hsl(var(--sv-surface-2))',
                color: showArchivedOnly ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-text-3))',
              }}
              title={showArchivedOnly ? "Show All" : "Show Archived"}
            >
              <Archive size={15} />
            </button>
          )}
          {!['profile', 'settings', 'clipboard', 'gallery'].includes(activeRailTab) && (
            <button
              id="new-chat-btn-v2"
              onClick={() => setShowNewChatModal(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'hsl(var(--sv-surface-2))', color: 'hsl(var(--sv-text-3))' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--sv-accent)/0.15)'; e.currentTarget.style.color = 'hsl(var(--sv-accent))'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'; e.currentTarget.style.color = 'hsl(var(--sv-text-3))'; }}
            >
              <Edit3 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {['chats', 'groups'].includes(activeRailTab) && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--sv-text-3))' }} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none transition-all"
              style={{
                background: 'hsl(var(--sv-surface-2))',
                border: '1px solid hsl(var(--sv-border))',
                color: 'hsl(var(--sv-text))',
              }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">

        {/* CHATS LIST */}
        {activeRailTab === 'chats' && (
          <div className="flex-1 overflow-y-auto scrollbar-custom px-2 pb-4 space-y-0.5">
            {loading && filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
                <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Loading chats…</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--sv-surface-2))' }}>
                  <MessageSquare size={24} style={{ color: 'hsl(var(--sv-text-3))' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>
                  No {showArchivedOnly ? 'archived ' : ''}conversations
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-xs px-4 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}
                >
                  Start a chat
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = selectedConversation?._id === conv._id;
                const convName = getConversationName(conv);
                const convAvatar = getConversationAvatar(conv);
                const online = isUserOnline(conv);
                const unread = conv.unreadCount?.[userId] || 0;
                const lastMsg = conv.lastMessage;
                const isConvTyping = typingUsers?.[conv._id];

                return (
                  <motion.div
                    key={conv._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedConversation(conv); setMobileShowSidebar(false); }}
                    className="flex items-center gap-3 cursor-pointer transition-all rounded-xl px-3 py-2.5"
                    style={{
                      background: isActive ? 'hsl(var(--sv-accent)/0.12)' : 'transparent',
                      border: isActive ? '1px solid hsl(var(--sv-accent)/0.2)' : '1px solid transparent',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {convAvatar
                          ? <img src={convAvatar} alt={convName} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                              {convName?.[0]?.toUpperCase()}
                            </div>
                        }
                      </div>
                      {online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 bg-emerald-500"
                          style={{ borderColor: 'hsl(var(--sv-surface))' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--sv-text))' }}>{convName}</span>
                        <span className="text-[10px] font-medium flex-shrink-0 ml-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                          {lastMsg ? fmtTime(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {isConvTyping ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium" style={{ color: '#10b981' }}>typing</span>
                            <span className="flex gap-0.5">
                              {[0, 1, 2].map(i => (
                                <span key={i} className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                              ))}
                            </span>
                          </div>
                        ) : (
                          <p className="text-[12px] truncate flex-1 pr-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            {lastMsg
                              ? lastMsg.type === "image" ? "📷 Photo"
                              : lastMsg.type === "file" ? "📎 File"
                              : lastMsg.type === "voice" ? "🎤 Voice message"
                              : lastMsg.content
                              : "No messages yet"}
                          </p>
                        )}
                        {unread > 0 && !isConvTyping && (
                          <div className="w-5 h-5 flex items-center justify-center rounded-full text-white text-[9px] font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                            {unread > 99 ? "99+" : unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* GROUPS LIST */}
        {activeRailTab === 'groups' && (
          <div className="flex-1 overflow-y-auto scrollbar-custom px-2 pb-4 space-y-0.5">
            {filteredConversations.filter(c => c.isGroup).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--sv-surface-2))' }}>
                  <Users size={24} style={{ color: 'hsl(var(--sv-text-3))' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>No group conversations yet</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-xs px-4 py-2 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}
                >
                  Create a Group
                </button>
              </div>
            ) : (
              filteredConversations.filter(c => c.isGroup).map((conv) => {
                const isActive = selectedConversation?._id === conv._id;
                const convName = getConversationName(conv);
                const convAvatar = getConversationAvatar(conv);
                const unread = conv.unreadCount?.[userId] || 0;
                const lastMsg = conv.lastMessage;
                return (
                  <motion.div
                    key={conv._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedConversation(conv); setMobileShowSidebar(false); }}
                    className="flex items-center gap-3 cursor-pointer transition-all rounded-xl px-3 py-2.5"
                    style={{
                      background: isActive ? 'hsl(var(--sv-accent)/0.12)' : 'transparent',
                      border: isActive ? '1px solid hsl(var(--sv-accent)/0.2)' : '1px solid transparent',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {convAvatar
                        ? <img src={convAvatar} alt={convName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                            {convName?.[0]?.toUpperCase()}
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--sv-text))' }}>{convName}</span>
                        <span className="text-[10px] font-medium flex-shrink-0 ml-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                          {lastMsg ? fmtTime(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] truncate flex-1 pr-2" style={{ color: 'hsl(var(--sv-text-3))' }}>
                          {lastMsg ? `${lastMsg.sender?.name || 'Someone'}: ${lastMsg.content}` : "No messages yet"}
                        </p>
                        {unread > 0 && (
                          <div className="w-5 h-5 flex items-center justify-center rounded-full text-white text-[9px] font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                            {unread > 99 ? "99+" : unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* CALLS */}
        {activeRailTab === 'calls' && (
          <div className="flex-1 overflow-y-auto scrollbar-custom px-3 pb-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 mt-2" style={{ color: 'hsl(var(--sv-text-3))' }}>Quick Call Contacts</p>
              <div className="space-y-2">
                {conversations.filter(c => !c.isGroup).map(conv => {
                  const otherUser = conv.participants?.find(p => p._id !== userId);
                  if (!otherUser) return null;
                  const online = isUserOnline(conv);
                  return (
                    <div key={conv._id} className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ background: 'hsl(var(--sv-surface-2))', borderColor: 'hsl(var(--sv-border))' }}>
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden">
                          {otherUser.avatar
                            ? <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                                {otherUser.name?.[0]?.toUpperCase()}
                              </div>
                          }
                          {online && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border" style={{ borderColor: 'hsl(var(--sv-surface-2))' }} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'hsl(var(--sv-text))' }}>{otherUser.name}</p>
                          <p className="text-[10px]" style={{ color: online ? '#10b981' : 'hsl(var(--sv-text-3))' }}>{online ? "Available" : "Offline"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveCall({ conversationId: conv._id, otherUser, type: 'voice', isInitiator: true })}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'hsl(var(--sv-accent)/0.15)', color: 'hsl(var(--sv-accent))' }}
                      >
                        <PhoneCall size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CHANNELS */}
        {activeRailTab === 'channels' && (
          <div className="flex-1 overflow-y-auto scrollbar-custom px-3 pb-4 space-y-4">
            <div className="p-5 rounded-2xl border flex flex-col items-center text-center gap-3 mt-2"
              style={{ background: 'hsl(var(--sv-surface-2))', borderColor: 'hsl(var(--sv-border))' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'hsl(var(--sv-accent)/0.1)', color: 'hsl(var(--sv-accent))' }}>
                <Megaphone size={28} />
              </div>
              <h4 className="text-sm font-bold" style={{ color: 'hsl(var(--sv-text))' }}>Community Channels</h4>
              <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Broadcast and explore community channels.</p>
            </div>
            <div className="p-3.5 rounded-xl border flex items-center justify-between"
              style={{ background: 'hsl(var(--sv-surface-2))', borderColor: 'hsl(var(--sv-border))' }}>
              <div>
                <p className="text-xs font-bold" style={{ color: 'hsl(var(--sv-text))' }}>📢 Samvaad Announcements</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--sv-text-3))' }}>1,240 subscribers</p>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                Join
              </button>
            </div>
          </div>
        )}

        {/* GALLERY */}
        {activeRailTab === 'gallery' && (
          <div className="flex-1 overflow-y-auto scrollbar-custom px-3 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 mt-2" style={{ color: 'hsl(var(--sv-text-3))' }}>Shared Media</p>
            {!selectedConversation ? (
              <p className="text-center text-xs py-20" style={{ color: 'hsl(var(--sv-text-3))' }}>Select a conversation to view shared media.</p>
            ) : messages.filter(m => m.type === 'image' || m.type === 'video').length === 0 ? (
              <p className="text-center text-xs py-20" style={{ color: 'hsl(var(--sv-text-3))' }}>No shared photos or videos.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {messages.filter(m => m.type === 'image' || m.type === 'video').map(msg => (
                  <a href={msg.mediaUrl || msg.content} target="_blank" rel="noopener noreferrer" key={msg.id}
                    className="aspect-square rounded-xl overflow-hidden hover:scale-[1.04] transition-all border"
                    style={{ borderColor: 'hsl(var(--sv-border))' }}>
                    <img src={msg.mediaUrl || msg.content} alt="shared" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OTHER TABS */}
        {activeRailTab === 'status' && <StatusPanel />}
        {activeRailTab === 'settings' && <SettingsSidebarPanel />}
        {activeRailTab === 'profile' && <ProfileSidebarPanel />}
        {activeRailTab === 'clipboard' && <ClipboardSync onClose={() => setActiveRailTab('chats')} />}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowNewChatModal(true)}
        className="md:hidden fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl z-40 transition-transform active:scale-95"
        style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}
      >
        <MessageSquare size={24} />
      </button>
    </aside>
  );
};

export default React.memo(ChatSidebar);
