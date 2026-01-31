import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Memo {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: number;
}

const colors = [
  'rgba(255, 179, 186, 0.3)',
  'rgba(255, 223, 186, 0.3)',
  'rgba(255, 255, 186, 0.3)',
  'rgba(186, 255, 201, 0.3)',
  'rgba(186, 225, 255, 0.3)',
  'rgba(223, 186, 255, 0.3)',
];

export function MemoGrid() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('memos');
    if (stored) {
      setMemos(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        saveMemo();
      }
    };

    if (editingMemo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingMemo, isCreating, memos]);

  const createMemo = () => {
    const newMemo: Memo = {
      id: Date.now().toString(),
      title: '',
      content: '',
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: Date.now(),
    };
    setEditingMemo(newMemo);
    setIsCreating(true);
  };

  const saveMemo = () => {
    if (!editingMemo) return;
    
    if (!editingMemo.title.trim() && !editingMemo.content.trim()) {
      setEditingMemo(null);
      setIsCreating(false);
      return;
    }

    if (isCreating) {
      setMemos([editingMemo, ...memos]);
    } else {
      setMemos(memos.map(m => m.id === editingMemo.id ? editingMemo : m));
    }
    
    setEditingMemo(null);
    setIsCreating(false);
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter(m => m.id !== id));
  };

  const editMemo = (memo: Memo) => {
    setEditingMemo({ ...memo });
    setIsCreating(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Memos</h2>
        <button
          onClick={createMemo}
          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full transition-all"
        >
          <Plus className="size-5 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {memos.map((memo) => (
            <div
              key={memo.id}
              onClick={() => editMemo(memo)}
              className="p-3 rounded-lg border border-white/20 cursor-pointer hover:scale-105 transition-all group relative"
              style={{ backgroundColor: memo.color }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMemo(memo.id);
                }}
                className="absolute top-2 right-2 p-1 bg-black/20 hover:bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-3 text-white" />
              </button>
              {memo.title && (
                <div className="font-medium text-white mb-2 pr-6 truncate">
                  {memo.title}
                </div>
              )}
              <div className="text-sm text-white/80 line-clamp-4 whitespace-pre-wrap">
                {memo.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingMemo && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-lg p-4 relative shadow-2xl"
              style={{ backgroundColor: editingMemo.color }}
            >
              <input
                type="text"
                value={editingMemo.title}
                onChange={(e) => setEditingMemo({ ...editingMemo, title: e.target.value })}
                placeholder="Title"
                autoFocus
                className="w-full bg-transparent border-none text-white placeholder:text-white/60 font-medium text-lg mb-2 focus:outline-none"
              />
              <textarea
                value={editingMemo.content}
                onChange={(e) => setEditingMemo({ ...editingMemo, content: e.target.value })}
                placeholder="Take a note..."
                className="w-full h-48 bg-transparent border-none text-white placeholder:text-white/60 resize-none focus:outline-none"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}