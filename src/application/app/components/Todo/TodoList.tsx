import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

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

export function TodoList({ date }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

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

  const getDateLabel = () => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
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

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {todosForDate.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            No tasks for this day
          </div>
        ) : (
          todosForDate.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded transition-all group"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.completed
                    ? 'bg-white/90 border-white/90'
                    : 'border-white/40 hover:border-white/60'
                }`}
              >
                {todo.completed && <Check className="size-3 text-black" />}
              </button>
              <span
                className={`flex-1 text-white ${
                  todo.completed ? 'line-through text-white/50' : ''
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="size-4 text-white/70 hover:text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
