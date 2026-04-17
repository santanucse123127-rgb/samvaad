import React from "react";
import { 
  MessageSquare, PhoneCall, CircleDot, Megaphone, Users, Archive, Sparkles, Image as ImageIcon, Settings 
} from "lucide-react";

const NavRail = ({ 
  activeRailTab, 
  setActiveRailTab, 
  unreadChatsCount, 
  unreadCallsCount, 
  hasNewStatuses, 
  archivedCount, 
  showArchivedOnly, 
  setShowArchivedOnly, 
  vibes, 
  setActiveVibe, 
  user 
}) => {
  return (
    <aside className="sv-nav-rail hidden md:flex" style={{ width: '80px', background: 'transparent' }}>
      <div className="flex flex-col items-center gap-6 w-full pt-6">
        {/* LOGO */}
        <div className="flex flex-col flex-shrink-0 items-center justify-center mb-4 cursor-pointer">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black mb-1">
            <div className="grid grid-cols-2 gap-[2px]">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        {/* Chats */}
        <div className="relative group">
          <button
            onClick={() => { setActiveRailTab("chats"); setShowArchivedOnly(false); }}
            className={`sv-nav-item ${activeRailTab === 'chats' && !showArchivedOnly ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
            title="Chats"
          >
            <MessageSquare size={22} />
          </button>
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#34D399] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
            </span>
          )}
        </div>

        {/* Calls */}
        <div className="relative group">
          <button
            onClick={() => setActiveRailTab("calls")}
            className={`sv-nav-item ${activeRailTab === 'calls' ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
            title="Calls"
          >
            <PhoneCall size={22} />
          </button>
          {unreadCallsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F87171] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadCallsCount}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="relative group">
          <button
            onClick={() => setActiveRailTab("status")}
            className={`sv-nav-item ${activeRailTab === 'status' ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
            title="Status"
          >
            <CircleDot size={22} />
          </button>
          {hasNewStatuses && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#34D399] rounded-full border-2 border-white" />
          )}
        </div>

        {/* Channels */}
        <button
          onClick={() => setActiveRailTab("channels")}
          className={`sv-nav-item ${activeRailTab === 'channels' ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
          title="Channels"
        >
          <Megaphone size={22} />
        </button>

        {/* Groups */}
        <button
          onClick={() => setActiveRailTab("groups")}
          className={`sv-nav-item ${activeRailTab === 'groups' ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
          title="Groups"
        >
          <Users size={22} />
        </button>

        <div className="w-8 h-[1px] bg-black/5 my-2" />

        {/* Archived */}
        <div className="relative group">
          <button
            onClick={() => { setActiveRailTab("chats"); setShowArchivedOnly(true); }}
            className={`sv-nav-item ${showArchivedOnly ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
            title="Archived"
          >
            <Archive size={22} />
          </button>
          {archivedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {archivedCount}
            </span>
          )}
        </div>

        {/* AI / Magic */}
        <button
          onClick={() => {
            const currentIndex = vibes.findIndex(v => v.id === activeVibe);
            const nextIndex = (currentIndex + 1) % vibes.length;
            setActiveVibe(vibes[nextIndex].id);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden group mt-2 bg-black"
          title="Magic Vibes"
        >
          <div className="absolute inset-[1.5px] bg-[#f8fafc] rounded-full flex items-center justify-center z-10">
            <Sparkles size={18} className="text-black group-hover:scale-110 transition-transform" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00A3FF] via-[#BC00FF] to-[#FF00D6] animate-spin-slow opacity-80 group-hover:opacity-100 transition-opacity z-0" />
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pb-6 w-full">
        {/* Gallery */}
        <button
          onClick={() => setActiveRailTab("gallery")}
          className={`sv-nav-item ${activeRailTab === 'gallery' ? 'active text-white bg-black shadow-lg shadow-black/20' : 'text-sv-text-3 hover:bg-black/5 hover:text-black'}`}
          title="Media"
        >
          <ImageIcon size={22} />
        </button>

        <div className="w-8 h-[1px] bg-black/5 my-2" />

        {/* Settings */}
        <button
          onClick={() => setActiveRailTab("settings")}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group ${activeRailTab === 'settings' ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-black/5 hover:bg-black/10 text-sv-text-3 hover:text-black'}`}
          title="Settings"
        >
          <Settings size={22} className={activeRailTab === 'settings' ? 'rotate-90' : 'group-hover:rotate-90 transition-transform duration-500'} />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setActiveRailTab("profile")}
          className={`w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition-transform ring-2 mt-2 ${activeRailTab === 'profile' ? 'ring-black' : 'ring-transparent hover:ring-black/20'}`}
          title="Profile"
        >
          <img src={user?.avatar || '/default-avatar.png'} alt={user?.name} className="w-full h-full object-cover" />
        </button>
      </div>
    </aside>
  );
};

export default NavRail;
