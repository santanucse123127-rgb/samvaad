import { motion } from "framer-motion";
import { Reply, Forward, Star, Trash2, Edit, Smile, Check, CheckCheck, Clock } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from "../../context/ChatContext";

const MessageItem = ({ message, isOwn, showAvatar, getMessageStatusIcon, onReply, onReaction, index }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const { votePoll, userId } = useChat();

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleVote = async (optionIndex) => {
    await votePoll(message.id, optionIndex);
  };

  const renderPoll = () => {
    const totalVotes = message.pollOptions?.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;

    return (
      <div className="min-w-[250px]">
        <h4 className="font-bold text-white mb-3 text-lg">{message.pollQuestion}</h4>
        <div className="space-y-2">
          {message.pollOptions?.map((option, idx) => {
            const voteCount = option.votes.length;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const hasVoted = option.votes.includes(userId);

            return (
              <div
                key={idx}
                onClick={() => handleVote(idx)}
                className={`relative p-2 rounded-lg cursor-pointer overflow-hidden border transition-all ${hasVoted
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                  }`}
              >
                {/* Progress Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-purple-500/20 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative flex justify-between items-center z-10">
                  <span className="font-medium text-gray-200">{option.text}</span>
                  <div className="flex items-center gap-2">
                    {hasVoted && <Check className="w-4 h-4 text-purple-400" />}
                    <span className="text-xs text-gray-400">{voteCount} ({percentage}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          Total votes: {totalVotes}
        </div>
      </div>
    );
  };

  const renderCode = () => {
    return (
      <div className="min-w-[300px] max-w-full overflow-hidden rounded-lg">
        <div className="bg-gray-900 px-4 py-1 text-xs text-gray-400 border-b border-gray-700 flex justify-between items-center">
          <span>{message.codeLanguage || 'code'}</span>
          <button
            onClick={() => navigator.clipboard.writeText(message.content)}
            className="hover:text-white transition-colors"
          >
            Copy
          </button>
        </div>
        <SyntaxHighlighter
          language={message.codeLanguage || 'javascript'}
          style={oneDark}
          customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem', fontSize: '0.875rem' }}
        >
          {message.content}
        </SyntaxHighlighter>
      </div>
    );
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
      <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
        {/* Avatar */}
        {!isOwn && showAvatar && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
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
              className={`absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 flex items-center gap-1 bg-gray-800 rounded-lg p-1 shadow-lg z-10 border border-gray-700`}
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
              className={`absolute ${isOwn ? 'left-0 -translate-x-full -ml-12' : 'right-0 translate-x-full mr-12'} top-0 flex items-center gap-1 bg-gray-800 rounded-lg p-2 shadow-xl z-20 border border-gray-700`}
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
            <div className="mb-2 p-2 bg-gray-800/50 rounded-lg border-l-4 border-purple-500 backdrop-blur-sm">
              <p className="text-xs text-purple-400 font-medium">
                {message.replyTo.sender?.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`${isOwn
                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-sm"
                : "bg-gray-800/90 text-gray-100 rounded-2xl rounded-tl-sm border border-gray-700/50"
              } px-4 py-2 shadow-lg relative backdrop-blur-sm`}
          >
            {!isOwn && message.name && conversation?.type === 'group' && (
              <p className="text-xs text-purple-400 font-medium mb-1">
                {message.name}
              </p>
            )}

            {/* Content Rendering based on Type */}
            {message.type === 'poll' ? (
              renderPoll()
            ) : message.type === 'code' ? (
              renderCode()
            ) : message.type === 'image' && message.mediaUrl ? (
              <img
                src={message.mediaUrl}
                alt="Shared"
                className="rounded-lg mb-2 max-w-sm cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            ) : message.type === 'text' ? (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.deleted ? <em className="text-gray-400">{message.content}</em> : message.content}
                {message.forwarded && (
                  <span className="ml-2 text-xs opacity-70">
                    <Forward className="w-3 h-3 inline" /> Forwarded
                  </span>
                )}
              </p>
            ) : null}

            {/* Message Footer */}
            <div className="flex items-center justify-end gap-1 mt-1">
              {message.edited && (
                <span className="text-[10px] opacity-60">edited</span>
              )}

              {/* Scheduled Indicator */}
              {message.status === 'scheduled' && (
                <span className="flex items-center gap-1 text-[10px] text-yellow-300 opacity-90 mr-1">
                  <Clock className="w-3 h-3" /> Scheduled
                </span>
              )}

              <span className="text-[10px] opacity-60 font-medium">
                {formatTime(message.timestamp)}
              </span>

              {isOwn && message.status !== 'scheduled' && getMessageStatusIcon(message.status)}
            </div>
          </div>

          {/* Message Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'} ml-2`}>
              {message.reactions.map((reaction, idx) => (
                <motion.div
                  key={idx}
                  className="px-2 py-0.5 bg-gray-800/80 border border-gray-700/50 rounded-full text-xs shadow-lg cursor-pointer hover:scale-110 transition-transform backdrop-blur-sm"
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