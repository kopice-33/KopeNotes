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

const DEFAULT_COLOR = 'rgba(0, 0, 0, 0.2)';

const colors  = [
  'rgba(255,162,162, 0.3)', // Soft pink
  'rgba(43,131,229, 0.3)', // Soft peach
  'rgba(103,255,168, 0.3)', // Soft yellow
  'rgba(56,25,191, 0.3)', // Soft mint
  'rgba(118,45,212, 0.3)', // Soft blue
//   'rgba(223, 186, 255, 0.3)', // Soft purple
//   'rgba(255, 204, 153, 0.3)', // Orange
//   'rgba(204, 255, 204, 0.3)', // Light green
//   'rgba(204, 229, 255, 0.3)', // Light blue
//   'rgba(255, 204, 255, 0.3)', // Light pink
];


export function MemoGrid() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const darkenColor = (color: string) => {
    if (!color) return 'rgba(255,255,255,0.8)';
        return color.replace('0.3', '0.7');
    };
    
    const opacityToHex = (opacity: number) => {
      const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
      return hex;
    };
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
      color: DEFAULT_COLOR,
      createdAt: Date.now(),
    };
    setEditingMemo(newMemo);
    setIsCreating(true);
  };

  const saveMemo = () => {
    if (!editingMemo) return;

  if (!editingMemo.title.trim() && !editingMemo.content.trim()) {
    if (!isCreating) {
      // Delete existing memo
      deleteMemo(editingMemo.id);
    }
    // For new memos, just don't save (already returns)
    setEditingMemo(null);
    setIsCreating(false);
    return;
  }
    
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

      <div className="flex-1 overflow-y-auto p-4" style={{
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)',
  }}>
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
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-lg p-4 relative shadow-2xl"
        style={{ backgroundColor: darkenColor(editingMemo.color) }}
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
        
<div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20 relative">
  <div className="relative">
    <button
      type="button"
      onClick={() => setShowColorPicker(!showColorPicker)}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
    >
      <div className="w-5 h-5 rounded-full border border-white/40" 
           style={{ backgroundColor: editingMemo.color }} />
    </button>
    
    {/* Color picker positioned relative to this button */}
{showColorPicker && (
  <div className="absolute bottom-full left-0 mb-2 w-64 bg-black/90 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-2xl z-50">
    <div className="grid grid-cols-5 gap-x-3 gap-y-3">
      {colors.map((color) => (
        <button
          key={color}
          onClick={(e) => {
            e.stopPropagation();
            // If clicking the already selected color, set to default
            if (editingMemo.color === color) {
              setEditingMemo({ ...editingMemo, color: DEFAULT_COLOR });
            } else {
              // Otherwise, select this color
              setEditingMemo({ ...editingMemo, color });
            }
            setShowColorPicker(false);
          }}
          className={`w-9 h-9 rounded-full border-2 relative ${
            editingMemo.color === color ? 'border-white scale-110' : 'border-white/30'
          } hover:scale-110 transition-transform`}
          style={{ backgroundColor: darkenColor(color) }}
        >
          {/* Show "X" mark if this is the currently selected color */}
          {editingMemo.color === color && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-0.5 bg-white rotate-45 rounded-full"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
)}
  </div>
  </div>
</motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}