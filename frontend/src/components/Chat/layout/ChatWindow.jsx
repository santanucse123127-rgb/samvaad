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
    <main
      className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300
        ${mobileShowSidebar ? 'hidden md:flex' : 'fixed md:relative inset-0 md:inset-auto z-50 md:z-0 flex pb-[env(safe-area-inset-bottom,0px)] md:pb-0'}`}
      style={{ background: '#ffffff' }}
    >
      <CallInterface />
      {/* Sticky header sits outside any scroll container */}
      <ChatHeader selectedConversation={selectedConversation} {...rest} />
      {/* Scrollable message area fills available space */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col">
        <MessageList selectedConversation={selectedConversation} {...rest} />
        <ChatInput selectedConversation={selectedConversation} {...rest} />
      </div>
    </main>
  );
};

export default ChatWindow;
