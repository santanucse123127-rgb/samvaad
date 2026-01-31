import { motion } from "framer-motion";
import { Reply, Forward, Star, Trash2, Edit, Smile, Check, CheckCheck } from "lucide-react";
import { useState } from "react";

const MessageItem = ({ message, isOwn, showAvatar, getMessageStatusIcon, onReply, onReaction, index }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[70%]`}>
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            {message.avatar ? (
              <img
                src={message.avatar}
                alt={message.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-white">
                {message.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
        )}
        {!isOwn && !showAvatar && <div className="w-8" />}

        {/* Message Content */}
        <div className="relative">
          {/* Message Actions (hover) */}
          {showActions && (
            <motion.div
              className={`absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex items-center gap-1 bg-gray-800 rounded-lg p-1 shadow-lg z-10`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button
                className="w-8 h-8 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                onClick={() => setShowReactions(!showReactions)}
                title="React"
              >
                <Smile className="w-4 h-4 text-gray-300" />
              </button>
              <button
                className="w-8 h-8 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                onClick={() => onReply(message)}
                title="Reply"
              >
                <Reply className="w-4 h-4 text-gray-300" />
              </button>
              {isOwn && (
                <>
                  <button
                    className="w-8 h-8 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-300" />
                  </button>
                  <button
                    className="w-8 h-8 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-gray-300" />
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Quick Reactions */}
          {showReactions && (
            <motion.div
              className={`absolute ${isOwn ? 'left-0 -translate-x-full -ml-12' : 'right-0 translate-x-full mr-12'} top-0 flex items-center gap-1 bg-gray-800 rounded-lg p-2 shadow-xl z-20`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl hover:scale-125 transition-transform"
                  onClick={() => onReaction(message.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}

          {/* Reply Preview */}
          {message.replyTo && (
            <div className="mb-2 p-2 bg-gray-800/50 rounded-lg border-l-4 border-purple-500">
              <p className="text-xs text-purple-400 font-medium">
                {message.replyTo.sender?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`${
              isOwn
                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-sm"
                : "bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm"
            } px-4 py-2 shadow-lg relative`}
          >
            {!isOwn && message.name && (
              <p className="text-xs text-purple-400 font-medium mb-1">
                {message.name}
              </p>
            )}

            {/* Media Content */}
            {message.type === 'image' && message.mediaUrl && (
              <img
                src={message.mediaUrl}
                alt="Shared"
                className="rounded-lg mb-2 max-w-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            )}
            {message.type === 'video' && message.mediaUrl && (
              <video
                src={message.mediaUrl}
                controls
                className="rounded-lg mb-2 max-w-sm"
              />
            )}
            {message.type === 'voice' && message.mediaUrl && (
              <div className="flex items-center gap-3 mb-2">
                <audio src={message.mediaUrl} controls className="max-w-xs" />
                {message.duration && (
                  <span className="text-xs opacity-70">{message.duration}s</span>
                )}
              </div>
            )}
            {message.type === 'file' && message.mediaUrl && (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg mb-2 hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold">FILE</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{message.fileName || 'File'}</p>
                  {message.fileSize && (
                    <p className="text-xs opacity-70">
                      {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </a>
            )}

            {/* Text Content */}
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.deleted ? <em>{message.content}</em> : message.content}
                {message.forwarded && (
                  <span className="ml-2 text-xs opacity-70">
                    <Forward className="w-3 h-3 inline" /> Forwarded
                  </span>
                )}
              </p>
            )}

            {/* Message Footer */}
            <div className="flex items-center justify-end gap-1 mt-1">
              {message.edited && (
                <span className="text-[10px] opacity-60">edited</span>
              )}
              <span className="text-[10px] opacity-60">
                {formatTime(message.timestamp)}
              </span>
              {isOwn && getMessageStatusIcon(message.status)}
            </div>
          </div>

          {/* Message Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction, idx) => (
                <motion.div
                  key={idx}
                  className="px-2 py-0.5 bg-gray-800 rounded-full text-sm shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {reaction.emoji}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;