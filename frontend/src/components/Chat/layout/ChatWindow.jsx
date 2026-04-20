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
      className={`
        flex-1 min-w-0 min-h-0
        relative flex flex-col
        transition-all duration-300
        ${mobileShowSidebar
          ? "hidden md:flex"
          : "fixed md:relative inset-0 md:inset-auto z-50 md:z-0 flex"}
      `}
      style={{ background: "#ffffff" }}
    >
      <CallInterface />

      {/* fixed-height header zone */}
      <div className="shrink-0">
        <ChatHeader selectedConversation={selectedConversation} {...rest} />
      </div>

      {/* only this area scrolls */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <MessageList selectedConversation={selectedConversation} {...rest} />

        {/* input fixed at bottom, no jumping */}
        <div className="shrink-0 pb-[env(safe-area-inset-bottom,0px)] md:pb-0">
          <ChatInput selectedConversation={selectedConversation} {...rest} />
        </div>
      </div>
    </main>
  );
};

export default React.memo(ChatWindow);