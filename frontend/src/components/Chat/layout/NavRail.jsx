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
  activeVibe, 
  setActiveVibe, 
  user 
}) => {
  return (
    <aside className="sv-nav-rail hidden md:flex">
      <div className="flex flex-col items-center gap-4 w-full pt-4">
        {/* Chats */}
        <div className="relative group">
          <button
            onClick={() => { setActiveRailTab("chats"); setShowArchivedOnly(false); }}
            className={`sv-nav-item ${activeRailTab === 'chats' && !showArchivedOnly ? 'active' : ''}`}
            title="Chats"
          >
            <MessageSquare size={22} />
          </button>
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#34D399] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1a1b]">
              {unreadChatsCount > 9 ? '9+' : unreadChatsCount}
            </span>
          )}
        </div>

        {/* Calls */}
        <div className="relative group">
          <button
            onClick={() => setActiveRailTab("calls")}
            className={`sv-nav-item ${activeRailTab === 'calls' ? 'active' : ''}`}
            title="Calls"
          >
            <PhoneCall size={22} />
          </button>
          {unreadCallsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F87171] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1a1b]">
              {unreadCallsCount}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="relative group">
          <button
            onClick={() => setActiveRailTab("status")}
            className={`sv-nav-item ${activeRailTab === 'status' ? 'active' : ''}`}
            title="Status"
          >
            <CircleDot size={22} />
          </button>
          {hasNewStatuses && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#34D399] rounded-full border-2 border-[#1a1a1b]" />
          )}
        </div>

        {/* Channels */}
        <button
          onClick={() => setActiveRailTab("channels")}
          className={`sv-nav-item ${activeRailTab === 'channels' ? 'active' : ''}`}
          title="Channels"
        >
          <Megaphone size={22} />
        </button>

        {/* Groups */}
        <button
          onClick={() => setActiveRailTab("groups")}
          className={`sv-nav-item ${activeRailTab === 'groups' ? 'active' : ''}`}
          title="Groups"
        >
          <Users size={22} />
        </button>

        <div className="w-8 h-[1px] bg-white/10 my-2" />

        {/* Archived */}
        <div className="relative group">
          <button
            onClick={() => { setActiveRailTab("chats"); setShowArchivedOnly(true); }}
            className={`sv-nav-item ${showArchivedOnly ? 'active' : ''}`}
            title="Archived"
          >
            <Archive size={22} />
          </button>
          {archivedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1a1a1b]">
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
          className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden group mt-2"
          title="Magic Vibes"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00A3FF] via-[#BC00FF] to-[#FF00D6] animate-spin-slow opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-[2px] bg-[#1a1a1b] rounded-full flex items-center justify-center">
            <Sparkles size={18} className="text-white group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pb-6 w-full">
        {/* Gallery */}
        <button
          onClick={() => setActiveRailTab("gallery")}
          className={`sv-nav-item ${activeRailTab === 'gallery' ? 'active' : ''}`}
          title="Media"
        >
          <ImageIcon size={22} />
        </button>

        <div className="w-8 h-[1px] bg-white/10 my-2" />

        {/* Settings */}
        <button
          onClick={() => setActiveRailTab("settings")}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group ${activeRailTab === 'settings' ? 'bg-sv-accent text-white shadow-lg shadow-sv-accent/20' : 'bg-white/5 hover:bg-white/10'}`}
          title="Settings"
        >
          <Settings size={22} className={activeRailTab === 'settings' ? 'rotate-90' : 'group-hover:rotate-90 transition-transform duration-500'} />
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setActiveRailTab("profile")}
          className={`w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition-transform ring-2 ${activeRailTab === 'profile' ? 'ring-sv-accent' : 'ring-transparent hover:ring-white/20'}`}
          title="Profile"
        >
          <img src={user?.avatar || '/default-avatar.png'} alt={user?.name} className="w-full h-full object-cover" />
        </button>
      </div>
    </aside>
  );
};

export default NavRail;
