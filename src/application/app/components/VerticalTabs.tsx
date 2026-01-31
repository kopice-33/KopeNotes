import { Timer, ListTodo, FileText } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'todo', label: 'Todo', icon: ListTodo },
  { id: 'memo', label: 'Memo', icon: FileText },
];

interface VerticalTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function VerticalTabs({ activeTab, onTabChange }: VerticalTabsProps) {
  return (
    <div className="flex flex-col gap-1 bg-black/30 backdrop-blur-sm p-1 border-r border-white/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative w-10 h-24 flex items-center justify-center
              transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-white/20 text-white' 
                : 'text-white/60 hover:bg-white/10 hover:text-white/80'
              }
              rounded
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(-90deg)' }}>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Icon className="size-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
