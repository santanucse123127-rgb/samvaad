import React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      className="flex-1 overflow-y-auto scrollbar-custom"
      style={{
        // Subtle dot-grid pattern like HYPER reference
        background: `
          radial-gradient(circle, hsl(230 15% 22% / 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        backgroundColor: 'hsl(230 20% 11%)',
      }}
    >
      <div className="max-w-2xl w-full mx-auto flex flex-col pt-4 pb-6 px-4 md:px-6 gap-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'hsl(var(--sv-accent))' }} />
              <p className="text-xs font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>Loading…</p>
            </div>
          </div>
        ) : (
          messagesWithDates.map((item) => {
            if (item.type === "date") return (
              <div key={item.id} className="flex items-center justify-center my-5">
                <span
                  className="text-[10px] uppercase tracking-[0.15em] px-4 py-1.5 rounded-full font-semibold"
                  style={{
                    background: 'hsl(230 18% 17%)',
                    color: 'hsl(var(--sv-text-3))',
                    border: '1px solid hsl(var(--sv-border))'
                  }}
                >
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
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-end gap-2 px-2"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default React.memo(MessageList);
