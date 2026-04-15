import React from "react";
import { Smile, Plus, Send, Mic, File, X, Reply } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ChatInput = ({
  replyToMessage,
  setReplyToMessage,
  uploadPreview,
  setUploadPreview,
  showEmojiPicker,
  setShowEmojiPicker,
  newMessage,
  handleInputChange,
  handleSend,
  fileInputRef,
  handleFileSelect,
  isRecording,
  startRecording,
  stopRecording,
  recordingDuration,
  fmtDuration
}) => {
  return (
    <div className="md:px-6 md:pb-6 md:pt-2 md:bg-gradient-to-t md:from-[hsl(var(--sv-bg))] md:via-[hsl(var(--sv-bg))/0.4] md:to-transparent sticky bottom-0 z-20 sv-input-bar-light">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {/* Previews (Reply/Upload) */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Reply size={14} className="text-sv-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-sv-accent uppercase tracking-tighter">Replying to {replyToMessage.name || 'user'}</p>
                <p className="text-xs truncate opacity-60">{replyToMessage.content}</p>
              </div>
              <button onClick={() => setReplyToMessage(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )}
          {uploadPreview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                {uploadPreview.type.startsWith("image/")
                  ? <img src={uploadPreview.preview} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center bg-white/5"><File size={16} /></div>
                }
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold truncate">{uploadPreview.name}</p>
                <p className="text-[10px] opacity-50 uppercase font-black">Ready to upload</p>
              </div>
              <button onClick={() => setUploadPreview(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="sv-input-container-v2 md:shadow-2xl relative md:bg-[hsl(var(--sv-surface-2))] sv-input-inner-light">
          <button onClick={() => setShowEmojiPicker(p => !p)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 text-gray-400 md:text-white/50 hover:text-sv-accent">
            <Smile size={22} />
          </button>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-[15px] py-3 text-gray-800 md:text-white"
            />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-sv-accent">
                <Plus size={22} />
              </button>
              {isRecording ? (
                <div className="flex items-center gap-3 pr-2">
                  <span className="text-xs font-bold tabular-nums text-red-500 animate-pulse">{fmtDuration(recordingDuration)}</span>
                  <button type="button" onClick={() => stopRecording(true)} className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                    <Send size={18} />
                  </button>
                </div>
              ) : (newMessage.trim() || uploadPreview) ? (
                <button type="submit" className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-sv-accent shadow-lg">
                  <Send size={20} />
                </button>
              ) : (
                <button type="button" onClick={startRecording} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-sv-accent">
                  <Mic size={22} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
    </div>
  );
};

export default ChatInput;
