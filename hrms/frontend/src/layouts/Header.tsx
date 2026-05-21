import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user } = useAuth();

  const initials = user
    ? `${(user.firstName?.[0] ?? '').toUpperCase()}${(user.lastName?.[0] ?? '').toUpperCase()}`
    : '??';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="md:hidden">
        <button className="flex items-center justify-center rounded-md p-2 hover:bg-muted text-muted-foreground">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search employees, documents, or settings..."
            className="h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </button>
        
        <button className="h-8 w-8 rounded-full border bg-muted flex items-center justify-center hover:opacity-80 transition-opacity">
          <span className="text-xs font-medium">{initials}</span>
        </button>
      </div>
    </header>
  );
}
