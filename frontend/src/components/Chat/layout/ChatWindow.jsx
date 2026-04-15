import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import CallInterface from "../CallInterface";

const ChatWindow = (props) => {
  const { 
    selectedConversation, 
    mobileShowSidebar, 
    ...rest 
  } = props;

  if (!selectedConversation) return null;

  return (
    <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300
      ${mobileShowSidebar ? 'hidden md:flex' : 'fixed inset-0 z-50 bg-[hsl(var(--sv-bg))] flex pb-[env(safe-area-inset-bottom,0px)]'}`}
    >
      <CallInterface />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
          <ChatHeader {...props} />
          <MessageList {...props} />
          <ChatInput {...props} />
        </div>
        {/* Profile Sidebar logic could also be extracted but keeping it for now if needed */}
      </div>
    </main>
  );
};

export default ChatWindow;
