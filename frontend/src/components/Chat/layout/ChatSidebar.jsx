import React from "react";
import { Plus, Search, MoreVertical, MessageSquare, Phone, Users, Archive } from "lucide-react";
import { motion } from "framer-motion";
import Avatar from "../Avatar";
import StatusPanel from "../StatusPanel";
import ProfileSidebarPanel from "../SettingsSidebarPanel"; // Assuming this is correct based on original
import SettingsSidebarPanel from "../SettingsSidebarPanel";

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
  fmtTime,
  fmtDate,
  togglePin,
  toggleArchive,
  setShowNewChatModal,
  mobileShowSidebar
}) => {
  return (
    <aside
      className={`sv-sidebar-v2 z-30 transition-all duration-300 ease-in-out
      fixed md:relative inset-y-0 left-0 md:left-0 h-full md:h-auto
      w-full md:w-[320px] pb-[72px] md:pb-0
      ${mobileShowSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-6 py-6 flex-shrink-0">
        <div className="md:hidden">
          <p className="text-sm font-medium text-sv-text-3">Hello,</p>
          <h2 className="text-2xl font-black text-sv-text leading-tight">
            {user?.name?.split(' ')[0] || "Johan"}
          </h2>
        </div>
        <h2 className="hidden md:block text-xl font-black italic tracking-tighter" style={{ color: 'hsl(var(--sv-text))' }}>
          {activeRailTab === 'chats' && showArchivedOnly ? "Archived" : activeRailTab === 'chats' ? "Messages" : activeRailTab.charAt(0).toUpperCase() + activeRailTab.slice(1)}
        </h2>
        <div className="flex items-center gap-2">
            <button className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-[hsl(var(--sv-surface-2))] text-sv-text-3 hover:text-sv-text transition-colors">
              <Search size={20} />
            </button>
            <button className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-[hsl(var(--sv-surface-2))] text-sv-text-3 hover:text-sv-text transition-colors">
              <MoreVertical size={20} />
            </button>
          <div className="hidden md:flex items-center gap-1">
            {activeRailTab === 'chats' && (
              <button
                onClick={() => setShowArchivedOnly(p => !p)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showArchivedOnly ? 'bg-sv-accent text-white shadow-[0_8px_24px_-8px_hsl(var(--sv-accent)/0.6)]' : 'bg-[hsl(var(--sv-surface-2))] hover:bg-[hsl(var(--sv-surface-3))] text-sv-text-2 hover:text-sv-text'}`}
                  title={showArchivedOnly ? "Show All" : "Show Archived"}
                >
                  <Archive size={16} />
              </button>
            )}
            {!['profile', 'settings'].includes(activeRailTab) && (
              <button
                id="new-chat-btn-v2"
                onClick={() => setShowNewChatModal(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-[hsl(var(--sv-surface-2))] hover:bg-[hsl(var(--sv-surface-3))] text-sv-accent"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      {!['profile', 'settings'].includes(activeRailTab) && (
        <div className="px-5 pb-4">
          <div className="relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white"
              style={{ color: 'hsl(var(--sv-text-3))' }}
            />
            <input
              type="text"
              placeholder={`Search ${activeRailTab}...`}
              className="sv-input rounded-2xl pl-10 py-2.5 text-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Panelled Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* CHATS LIST */}
        {activeRailTab === 'chats' && (
          <div className="flex-1 overflow-y-auto scrollbar-custom px-2 pb-4">
            {loading && filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
                <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>Loading chats…</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <MessageSquare size={32} style={{ color: 'hsl(var(--sv-text-3))' }} />
                <p className="text-sm" style={{ color: 'hsl(var(--sv-text-3))' }}>No {(showArchivedOnly) ? 'archived' : ''} conversations</p>
                <button onClick={() => setShowNewChatModal(true)} className="sv-btn-primary text-xs px-4 py-2">
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

                return (
                  <motion.div
                    key={conv._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedConversation(conv); setMobileShowSidebar(false); }}
                    className={`sv-conv-item relative group ${isActive ? "active" : ""}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar src={convAvatar} name={convName} size={14} />
                      {online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[hsl(var(--sv-surface))] rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[15px] truncate text-sv-text">{convName}</span>
                        <span className="sv-conv-time md:text-[10px] md:font-medium">
                          {lastMsg ? fmtTime(lastMsg.createdAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-sv-text-3 pr-3 truncate md:text-[12px]">
                          {lastMsg ? (lastMsg.type === "image" ? "📷 Photo" : lastMsg.type === "file" ? "📎 File" : lastMsg.content) : "No messages yet"}
                        </p>
                        {unread > 0 && (
                          <div className="sv-unread-badge ml-2 shrink-0">
                            {unread > 99 ? "99+" : unread}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(conv._id); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--sv-surface-3))] text-sv-text-3 hover:text-sv-text"
                        title="Pin"
                      >
                        <MoreVertical size={12} /> {/* Using MoreVertical as placeholder or Check */}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* Other Tabs */}
        {activeRailTab === 'status' && <StatusPanel />}
        {activeRailTab === 'settings' && <SettingsSidebarPanel />}
        {/* Add other panels similar to the above */}
      </div>

      <button
        onClick={() => setShowNewChatModal(true)}
        className="md:hidden fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center sv-gradient text-white shadow-[0_16px_30px_-10px_hsl(var(--sv-accent)/0.55)] z-40 transition-transform active:scale-95"
      >
        <MessageSquare size={24} />
      </button>
    </aside>
  );
};

export default ChatSidebar;
