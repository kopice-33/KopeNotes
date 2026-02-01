import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, CalendarClock, EllipsisVertical } from 'lucide-react';
import { format, isToday, isYesterday, isTomorrow, addDays } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  createdAt: number;
}

interface TodoListProps {
  date: Date;
}

interface SortableTodoItemProps {
  todo: Todo;
  editingId: string | null;
  editingText: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToNextDay: (id: string) => void;
  onStartEditing: (id: string, text: string) => void;
  onSaveEdit: (id: string) => void;
  onEditTextChange: (text: string) => void;
}

function SortableTodoItem({ 
  todo, 
  editingId, 
  editingText, 
  onToggle, 
  onDelete, 
  onMoveToNextDay,
  onStartEditing,
  onSaveEdit,
  onEditTextChange
}: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transform ? 'transform 150ms ease' : 'none',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded transition-all group"
    >
      {/* Drag handle - 3 dots */}
      <button
        className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/60 p-0 -ml-3"
        {...attributes}
        {...listeners}
      >
        <EllipsisVertical className="size-4" />
      </button>

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(todo.id);
        }}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all -ml-3 ${
          todo.completed
            ? 'bg-white/90 border-white/90'
            : 'border-white/40 hover:border-white/60'
        }`}
      >
        {todo.completed && <Check className="size-3 text-black" />}
      </button>
      
      {/* Todo text or edit input */}
      {editingId === todo.id ? (
        <input
          type="text"
          value={editingText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(todo.id)}
          onBlur={() => onSaveEdit(todo.id)}
          className="flex-1 px-2 py-1 bg-white/10 border border-white/30 rounded text-white focus:outline-none"
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 text-white cursor-text ${todo.completed ? 'line-through text-white/50' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!todo.completed) onStartEditing(todo.id, todo.text);
          }}
        >
          {todo.text}
        </span>
      )}
      
      {/* Action buttons */}
      {editingId !== todo.id && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveToNextDay(todo.id);
            }}
            className="p-1.5 text-white/70 hover:text-blue-400 hover:bg-white/10 rounded transition-colors"
            title="Move to next day"
          >
            <CalendarClock className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="p-1.5 text-white/70 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
            title="Delete task"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function TodoList({ date }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const dateKey = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    const stored = localStorage.getItem('todos');
    if (stored) {
      setTodos(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const todosForDate = todos.filter(todo => todo.date === dateKey);

  const addTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      date: dateKey,
      createdAt: Date.now(),
    };

    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const moveToNextDay = (id: string) => {
    const nextDay = addDays(date, 1);
    const nextDayKey = format(nextDay, 'yyyy-MM-dd');
    
    setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, date: nextDayKey } : todo
    ));
    };

  const getDateLabel = () => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMMM d, yyyy');
  };

    const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
    };

    const saveEdit = (id: string) => {
    if (!editingText.trim()) {
        // If empty, delete the todo
        deleteTodo(id);
        return;
    }
    
    setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, text: editingText } : todo
    ));
    setEditingId(null);
    setEditingText('');
    };

    const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    })
    );

    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
        setTodos((prevTodos) => {
        const todosCopy = [...prevTodos];
        const oldIndex = todosCopy.findIndex(todo => todo.id === active.id);
        const newIndex = todosCopy.findIndex(todo => todo.id === over?.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
            const [movedTodo] = todosCopy.splice(oldIndex, 1);
            todosCopy.splice(newIndex, 0, movedTodo);
        }
        
        return todosCopy;
        });
    }
    };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-medium text-white mb-3">{getDateLabel()}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded flex items-center gap-2 text-white transition-all"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-180px)] overflow-y-auto p-4 space-y-2"   style={{
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)',
  }}>
        {todosForDate.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            No tasks for this day
          </div>
        ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext
            items={todosForDate.map(todo => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {todosForDate.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  editingId={editingId}
                  editingText={editingText}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onMoveToNextDay={moveToNextDay}
                  onStartEditing={startEditing}
                  onSaveEdit={saveEdit}
                  onEditTextChange={setEditingText}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        )}
      </div>
    </div>
  );
}
