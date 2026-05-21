import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Drawer({ isOpen, onClose, title, description, children }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl border-l bg-background shadow-2xl duration-300 animate-in slide-in-from-right">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
