import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CalendarDays, Palmtree, IndianRupee, 
  UserPlus, CheckSquare, FileText, Target, BarChart3, Bell, 
  Monitor, ReceiptText, LifeBuoy, BookOpen, Activity, Settings, 
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import type { RoleName } from '@hrms/shared';

/* ── Admin roles that see the full management portal ── */
const ADMIN_ROLES: RoleName[] = ['super_admin', 'hr_admin'];
const MANAGER_ROLES: RoleName[] = [...ADMIN_ROLES, 'manager'];

/* ──────────────────────────────────────────────────────
   Navigation items with proper role-based access:
   - 'employee' role sees ONLY self-service items
   - Admin/manager roles see management items
   ────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { name: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard',     roles: ['*'] },
  { name: 'Employees',     icon: Users,           path: '/employees',     roles: ['super_admin', 'hr_admin', 'manager'] },
  { name: 'Attendance',    icon: CalendarDays,     path: '/attendance',    roles: ['super_admin', 'hr_admin', 'manager'] },
  { name: 'Leave',         icon: Palmtree,         path: '/leave',         roles: ['*'] },
  { name: 'Payroll',       icon: IndianRupee,      path: '/payroll',       roles: ['super_admin', 'hr_admin', 'finance'] },
  { name: 'Recruitment',   icon: UserPlus,         path: '/recruitment',   roles: ['super_admin', 'hr_admin', 'recruiter'] },
  { name: 'Onboarding',    icon: CheckSquare,      path: '/onboarding',    roles: ['super_admin', 'hr_admin', 'manager'] },
  { name: 'Documents',     icon: FileText,         path: '/documents',     roles: ['*'] },
  { name: 'Performance',   icon: Target,           path: '/performance',   roles: ['super_admin', 'hr_admin', 'manager'] },
  { name: 'Analytics',     icon: BarChart3,        path: '/analytics',     roles: ['super_admin', 'hr_admin', 'manager'] },
  { name: 'Notifications', icon: Bell,             path: '/notifications', roles: ['*'], badge: 3 },
  { name: 'Assets',        icon: Monitor,          path: '/assets',        roles: ['super_admin', 'it_admin'] },
  { name: 'Expenses',      icon: ReceiptText,      path: '/expenses',      roles: ['*'] },
  { name: 'Helpdesk',      icon: LifeBuoy,         path: '/helpdesk',      roles: ['*'] },
  { name: 'LMS',           icon: BookOpen,         path: '/lms',           roles: ['*'] },
  { name: 'Monitoring',    icon: Activity,         path: '/monitoring',    roles: ['super_admin', 'hr_admin'] },
  { name: 'Settings',      icon: Settings,         path: '/settings',      roles: ['super_admin', 'hr_admin', 'it_admin'] },
];

/* ── Role badge labels ── */
const ROLE_LABELS: Record<RoleName, string> = {
  super_admin: 'Super Admin',
  hr_admin: 'HR Admin',
  manager: 'Manager',
  recruiter: 'Recruiter',
  employee: 'Employee',
  finance: 'Finance',
  it_admin: 'IT Admin',
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  /* Read role from auth store – fall back to employee (most restrictive) */
  const userRole: RoleName = user?.role ?? 'employee';

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => item.roles.includes('*') || item.roles.includes(userRole)
  );

  /* Build user initials */
  const initials = user
    ? `${(user.firstName?.[0] ?? '').toUpperCase()}${(user.lastName?.[0] ?? '').toUpperCase()}`
    : '??';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  const email = user?.email ?? '';
  const roleLabel = ROLE_LABELS[userRole] ?? userRole;

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300 z-10",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Users size={20} />
            </div>
            <span className="text-red-500">VRPI</span> HRMS
          </div>
        )}
        {collapsed && (
          <div className="mx-auto bg-primary text-primary-foreground p-1.5 rounded-md">
            <Users size={20} />
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon size={20} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
                {!collapsed && <span>{item.name}</span>}
                
                {item.badge && !collapsed && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border text-sm font-medium">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="truncate text-sm font-medium">{fullName}</span>
              <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
            </div>
            <button
              onClick={() => { clearAuth(); window.location.href = '/login'; }}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="h-9 w-9 mx-auto rounded-full bg-muted flex items-center justify-center border text-sm font-medium" title={`${fullName} (${roleLabel})`}>
            {initials}
          </div>
        )}
      </div>
    </aside>
  );
}
