import React from "react";
import { 
  MessageSquare, PhoneCall, CircleDot, Megaphone, Users, Archive, Sparkles, Image as ImageIcon, Settings,
  Clipboard, CheckSquare
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
  user,
  showTaskPanel,
  setShowTaskPanel,
  tasks = []
}) => {
  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0"
      style={{
        width: 68,
        background: 'hsl(var(--sv-bg))',
        borderRight: '1px solid hsl(var(--sv-border))',
      }}
    >
      <div className="flex flex-col items-center w-full h-full py-5 gap-1">
        {/* LOGO */}
        <div className="flex flex-col flex-shrink-0 items-center justify-center mb-4 cursor-pointer">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl relative overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
            <div className="grid grid-cols-2 gap-[3px] z-10 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        {/* Chats */}
        <NavItem
          onClick={() => { setActiveRailTab("chats"); setShowArchivedOnly(false); }}
          active={activeRailTab === 'chats' && !showArchivedOnly}
          title="Chats"
          badge={unreadChatsCount}
          badgeColor="#10b981"
        >
          <MessageSquare size={20} />
        </NavItem>

        {/* Calls */}
        <NavItem
          onClick={() => setActiveRailTab("calls")}
          active={activeRailTab === 'calls'}
          title="Calls"
          badge={unreadCallsCount}
          badgeColor="#f87171"
        >
          <PhoneCall size={20} />
        </NavItem>

        {/* Status */}
        <NavItem
          onClick={() => setActiveRailTab("status")}
          active={activeRailTab === 'status'}
          title="Status"
          dot={hasNewStatuses}
        >
          <CircleDot size={20} />
        </NavItem>

        {/* Channels */}
        <NavItem
          onClick={() => setActiveRailTab("channels")}
          active={activeRailTab === 'channels'}
          title="Channels"
        >
          <Megaphone size={20} />
        </NavItem>

        {/* Groups */}
        <NavItem
          onClick={() => setActiveRailTab("groups")}
          active={activeRailTab === 'groups'}
          title="Groups"
        >
          <Users size={20} />
        </NavItem>

        <div className="w-8 h-px my-2" style={{ background: 'hsl(var(--sv-border))' }} />

        {/* Archived */}
        <NavItem
          onClick={() => { setActiveRailTab("chats"); setShowArchivedOnly(true); }}
          active={showArchivedOnly}
          title="Archived"
          badge={archivedCount}
          badgeColor="#10b981"
        >
          <Archive size={20} />
        </NavItem>

        {/* Clipboard */}
        <NavItem
          onClick={() => setActiveRailTab("clipboard")}
          active={activeRailTab === 'clipboard'}
          title="Clipboard Sync"
        >
          <Clipboard size={20} />
        </NavItem>

        {/* Tasks */}
        <NavItem
          onClick={() => setShowTaskPanel(true)}
          active={showTaskPanel}
          title="Tasks"
          badge={pendingTasksCount}
          badgeColor="#f59e0b"
        >
          <CheckSquare size={20} />
        </NavItem>

        {/* Vibes / Magic */}
        <button
          onClick={() => {
            if (vibes && setActiveVibe) {
              const currentIndex = vibes.findIndex(v => v.id === undefined);
              const nextIndex = (currentIndex + 1) % vibes.length;
              setActiveVibe(vibes[nextIndex]?.id);
            }
          }}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden mt-1 group"
          title="Magic Vibes"
          style={{ background: 'hsl(var(--sv-surface-2))' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)/0.3), hsl(var(--sv-accent-2)/0.3))' }} />
          <Sparkles size={18} className="relative z-10" style={{ color: 'hsl(var(--sv-text-3))' }} />
        </button>

        {/* Bottom section */}
        <div className="mt-auto flex flex-col items-center gap-2">
          {/* Gallery */}
          <NavItem
            onClick={() => setActiveRailTab("gallery")}
            active={activeRailTab === 'gallery'}
            title="Gallery"
          >
            <ImageIcon size={20} />
          </NavItem>

          <div className="w-8 h-px my-1" style={{ background: 'hsl(var(--sv-border))' }} />

          {/* Settings */}
          <button
            onClick={() => setActiveRailTab("settings")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${activeRailTab === 'settings' ? 'text-white' : 'hover:bg-white/5'}`}
            style={{
              background: activeRailTab === 'settings' ? 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' : 'transparent',
              color: activeRailTab === 'settings' ? 'white' : 'hsl(var(--sv-text-3))',
              boxShadow: activeRailTab === 'settings' ? '0 4px 20px -4px hsl(var(--sv-accent)/0.5)' : 'none'
            }}
            title="Settings"
          >
            <Settings size={20} className={`transition-transform duration-500 ${activeRailTab === 'settings' ? 'rotate-90' : 'group-hover:rotate-45'}`} />
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => setActiveRailTab("profile")}
            className="relative w-9 h-9 rounded-full overflow-hidden transition-all hover:scale-110 mt-1"
            style={{
              boxShadow: activeRailTab === 'profile'
                ? '0 0 0 2px hsl(var(--sv-accent)), 0 0 0 4px hsl(var(--sv-accent)/0.2)'
                : '0 0 0 2px hsl(var(--sv-border))'
            }}
            title={user?.name || "Profile"}
          >
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
          </button>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ children, onClick, active, title, badge, badgeColor, dot }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      title={title}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{
        background: active
          ? 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))'
          : 'transparent',
        color: active ? 'white' : 'hsl(var(--sv-text-3))',
        boxShadow: active ? '0 4px 20px -6px hsl(var(--sv-accent)/0.6)' : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'hsl(var(--sv-surface-2))'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>

    {/* Badge */}
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-white text-[9px] font-black border-2"
        style={{ background: badgeColor || 'hsl(var(--sv-accent))', borderColor: 'hsl(var(--sv-bg))' }}>
        {badge > 9 ? '9+' : badge}
      </span>
    )}

    {/* Dot indicator */}
    {dot && (
      <span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
        style={{ background: '#10b981', borderColor: 'hsl(var(--sv-bg))' }} />
    )}

    {/* Tooltip */}
    <div className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
      style={{ background: 'hsl(var(--sv-surface-3))', color: 'hsl(var(--sv-text))', border: '1px solid hsl(var(--sv-border))' }}>
      {title}
    </div>
  </div>
);

export default React.memo(NavRail);
