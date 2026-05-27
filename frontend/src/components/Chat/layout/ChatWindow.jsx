import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import CallInterface from "../CallInterface";
import { MessageSquare } from "lucide-react";

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 select-none">
    <div className="relative">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, hsl(var(--sv-accent)/0.2), hsl(var(--sv-accent-2)/0.2))', border: '1px solid hsl(var(--sv-accent)/0.2)' }}>
        <MessageSquare size={32} style={{ color: 'hsl(var(--sv-accent))' }} />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
        style={{ background: 'hsl(var(--sv-accent)/0.4)' }} />
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
        style={{ background: 'hsl(var(--sv-accent))' }} />
    </div>
    <div className="text-center">
      <h3 className="font-bold text-base mb-1" style={{ color: 'hsl(var(--sv-text))' }}>
        Start a Conversation
      </h3>
      <p className="text-sm" style={{ color: 'hsl(var(--sv-text-3))' }}>
        Select a chat from the sidebar to begin
      </p>
    </div>
  </div>
);

const ChatWindow = (props) => {
  const {
    selectedConversation,
    mobileShowSidebar,
    ...rest
  } = props;

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col" style={{ background: 'hsl(var(--sv-surface-2))' }}>
        <EmptyState />
      </div>
    );
  }

  return (
    <main
      className={`
        flex-1 min-w-0 min-h-0 h-full
        relative flex flex-col
        transition-all duration-300
        ${mobileShowSidebar
          ? "hidden md:flex"
          : "fixed md:relative inset-0 md:inset-auto z-50 md:z-0 flex"}
      `}
      style={{ background: "hsl(var(--sv-surface-2))" }}
    >
      <CallInterface />

      {/* Header */}
      <div className="shrink-0">
        <ChatHeader selectedConversation={selectedConversation} {...rest} />
      </div>

      {/* Messages + Input */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <MessageList selectedConversation={selectedConversation} {...rest} />
        <div className="shrink-0 pb-[env(safe-area-inset-bottom,0px)] md:pb-0">
          <ChatInput selectedConversation={selectedConversation} {...rest} />
        </div>
      </div>
    </main>
  );
};

export default React.memo(ChatWindow);