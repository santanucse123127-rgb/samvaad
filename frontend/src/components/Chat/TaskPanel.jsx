import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Circle, Clock, Trash2, Calendar, AlertCircle } from "lucide-react";
import { useChat } from "../../context/ChatContext";

const TaskPanel = ({ isOpen, onClose }) => {
    const { tasks, toggleTaskStatus, removeTask } = useChat();

    if (!isOpen) return null;

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <>
            {/* Mobile backdrop */}
            <motion.div
                className="fixed inset-0 bg-black/60 z-[300] md:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.aside
                className="fixed right-0 top-0 h-full z-[301] border-l overflow-hidden flex flex-col shadow-2xl"
                style={{
                    width: 'min(92vw, 360px)',
                    background: 'hsl(var(--sv-surface))',
                    borderColor: 'hsl(var(--sv-border) / 0.5)',
                }}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className="flex items-center justify-between p-4 border-b bg-black/5" style={{ borderColor: 'hsl(var(--sv-border) / 0.5)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <CheckCircle2 size={18} />
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'hsl(var(--sv-text))' }}>My Tasks</span>
                    </div>
                    <button onClick={onClose} className="sv-icon-btn w-8 h-8 rounded-lg"><X size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
                    {/* Pending Section */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            Pending — {pendingTasks.length}
                        </h4>
                        {pendingTasks.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed rounded-2xl" style={{ borderColor: 'hsl(var(--sv-border) / 0.3)' }}>
                                <Clock size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>No pending tasks</p>
                            </div>
                        ) : (
                            pendingTasks.map(task => (
                                <TaskItem key={task._id} task={task} onToggle={toggleTaskStatus} onDelete={removeTask} />
                            ))
                        )}
                    </div>

                    {/* Completed Section */}
                    {completedTasks.length > 0 && (
                        <div className="space-y-3 opacity-60">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--sv-text-3))' }}>
                                Completed — {completedTasks.length}
                            </h4>
                            {completedTasks.map(task => (
                                <TaskItem key={task._id} task={task} onToggle={toggleTaskStatus} onDelete={removeTask} />
                            ))}
                        </div>
                    )}
                </div>
            </motion.aside>
        </>
    );
};

const TaskItem = ({ task, onToggle, onDelete }) => {
    const isCompleted = task.status === 'completed';
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isCompleted;

    return (
        <motion.div
            layout
            className="group p-3.5 rounded-2xl border transition-all hover:bg-white/5"
            style={{
                background: 'hsl(var(--sv-surface-2))',
                borderColor: isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'hsl(var(--sv-border) / 0.5)'
            }}
        >
            <div className="flex gap-3">
                <button
                    onClick={() => onToggle(task._id, !isCompleted)}
                    className="mt-0.5 flex-shrink-0"
                >
                    {isCompleted
                        ? <CheckCircle2 size={18} className="text-green-500" />
                        : <Circle size={18} className={isOverdue ? "text-red-500/50" : "text-white/20"} />
                    }
                </button>
                <div className="flex-1 min-w-0">
                    <h5 className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-white/30' : 'text-white'}`}>
                        {task.title}
                    </h5>
                    {task.description && (
                        <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'hsl(var(--sv-text-3))' }}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                        {task.deadline && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'}`}>
                                <Calendar size={10} />
                                {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                                task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400' :
                                    'bg-blue-500/10 text-blue-400'
                            }`}>
                            {task.priority}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(task._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 transition-opacity text-red-500/40 hover:text-red-500"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default TaskPanel;
