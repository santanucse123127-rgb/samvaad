import React from "react";
import { AnimatePresence } from "framer-motion";
import MessageItem from "../MessageItem";
import TypingIndicator from "../TypingIndicator";

const MessageList = ({
  messageContainerRef,
  handleScroll,
  messagesWithDates,
  userId,
  setReplyToMessage,
  addReaction,
  setForwardMessageData,
  setShowForwardModal,
  isTyping,
  messagesEndRef,
  loading
}) => {
  return (
    <div
      ref={messageContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scrollbar-custom px-4 md:px-6 py-4 flex flex-col gap-1"
      style={{ background: 'hsl(var(--sv-bg))' }}
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-1 pt-2 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'hsl(var(--sv-accent))' }} />
          </div>
        ) : (
          messagesWithDates.map((item) => {
            if (item.type === "date") return (
              <div key={item.id} className="flex items-center justify-center my-4">
                <span className="text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full font-bold"
                  style={{
                    background: 'hsl(var(--sv-surface-2))',
                    color: 'hsl(var(--sv-text-3))',
                    border: '1px solid hsl(var(--sv-border))'
                  }}>
                  {item.label}
                </span>
              </div>
            );
            return (
              <MessageItem
                key={item.id || item._id}
                message={item}
                isOwn={item.sender === "user" || item.sender?._id === userId}
                onReply={setReplyToMessage}
                onReact={addReaction}
                onForward={(msg) => { setForwardMessageData(msg); setShowForwardModal(true); }}
                userId={userId}
              />
            );
          })
        )}
        <AnimatePresence>
          {isTyping && (
            <div className="flex items-end gap-3 px-2">
              <TypingIndicator />
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
