import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, FileText, CheckCircle, Info, AlertTriangle, 
  Settings, Search, Filter, Mail, MessageSquare, 
  Zap, Clock, ArrowUpRight, Activity, Target,
  Sparkles, History, MoreVertical, ShieldCheck,
  Send, Trash2, CheckCircle2, Globe, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// --- Mock Data ---
const COMM_KPI = [
  { title: 'Active Alerts', value: '14', icon: Bell, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '8 High Priority' },
  { title: 'Resolution', value: '92%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Avg 4h response' },
  { title: 'Broadcasting', value: 'Live', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', trend: '4 Active Campaigns' },
  { title: 'System Health', value: 'Optimal', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'All nodes online' },
];

const NOTIFICATIONS = [
  { 
    id: '1', 
    title: 'New Policy Update', 
    desc: 'The remote work policy has been updated for Q3. Please review and sign.', 
    time: '2 hours ago', 
    type: 'SYSTEM', 
    priority: 'HIGH',
    unread: true,
    icon: FileText,
    color: 'bg-blue-500'
  },
  { 
    id: '2', 
    title: 'Leave Approved', 
    desc: 'Your sick leave for May 12 has been approved by HR Governance.', 
    time: '1 day ago', 
    type: 'HR', 
    priority: 'LOW',
    unread: false,
    icon: CheckCircle,
    color: 'bg-emerald-500'
  },
  { 
    id: '3', 
    title: 'Security Alert', 
    desc: 'A login from an unrecognized device was detected in Singapore.', 
    time: '4 hours ago', 
    type: 'SECURITY', 
    priority: 'CRITICAL',
    unread: true,
    icon: ShieldCheck,
    color: 'bg-rose-500'
  },
  { 
    id: '4', 
    title: 'Payroll Finalized', 
    desc: 'May 2025 payroll has been successfully processed and disbursed.', 
    time: '6 hours ago', 
    type: 'PAYROLL', 
    priority: 'MEDIUM',
    unread: false,
    icon: Zap,
    color: 'bg-amber-500'
  },
];

export function NotificationsPage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Comm Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Awareness Terminal</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Activity className="h-4 w-4 text-indigo-500" />
            Operational Alert Stream • Real-time Communication Hub
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
             Clear History
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark All Read
          </Button>
        </div>
      </div>

      {/* 2. Alert KPIs */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {COMM_KPI.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all">
              <CardContent className="p-6 flex flex-col h-full">
                <div className={cn("h-12 w-12 rounded-2xl mb-4 flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">{stat.title}</h3>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                   <Target className="h-3 w-3" /> {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 3. Operational Feed */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
              <div className="flex items-center gap-6">
                 {['ALL', 'UNREAD', 'CRITICAL', 'SYSTEM'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all",
                        filter === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {tab}
                    </button>
                 ))}
              </div>
              <div className="relative group min-w-[240px]">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <Input 
                   placeholder="Search alerts..." 
                   className="h-11 pl-11 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                 {NOTIFICATIONS.map((notif, idx) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                       <Card className={cn(
                         "border-none shadow-xl bg-white rounded-[28px] overflow-hidden group hover:shadow-2xl transition-all cursor-pointer border-l-[6px]",
                         notif.priority === 'CRITICAL' ? 'border-rose-500' : 'border-transparent',
                         notif.unread ? "ring-2 ring-indigo-600/5 bg-indigo-50/10" : ""
                       )}>
                          <CardContent className="p-6 flex items-start gap-6">
                             <div className={cn(
                               "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform text-white",
                               notif.color
                             )}>
                                <notif.icon className="h-7 w-7" />
                             </div>
                             <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                        notif.priority === 'CRITICAL' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                                      )}>{notif.type} • {notif.priority}</span>
                                      {notif.unread && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />}
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase">{notif.time}</span>
                                </div>
                                <h3 className="text-base font-black text-slate-900">{notif.title}</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">{notif.desc}</p>
                                
                                <div className="pt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button variant="ghost" className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200">View Action</Button>
                                   <Button variant="ghost" className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50">Dismiss</Button>
                                </div>
                             </div>
                             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100"><MoreVertical className="h-5 w-5 text-slate-400" /></Button>
                          </CardContent>
                       </Card>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

        {/* Intelligence Side */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Distribution
                    <Activity className="h-5 w-5 text-indigo-600" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { label: 'System Announcements', count: '42%', color: 'bg-blue-500' },
                   { label: 'HR Approvals', count: '28%', color: 'bg-emerald-500' },
                   { label: 'Security Alerts', count: '15%', color: 'bg-rose-500' },
                   { label: 'Payroll Updates', count: '15%', color: 'bg-amber-500' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <span>{item.label}</span>
                         <span>{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: item.count }}
                           transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                           className={cn("h-full rounded-full", item.color)} 
                         />
                      </div>
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-8">
                 <div className="h-16 w-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">Broadcast Hub</h3>
                    <p className="text-sm font-medium text-white/60 leading-relaxed">
                       Create and schedule global announcements across all employee touchpoints.
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white">
                    <Send className="mr-2 h-4 w-4" /> New Broadcast
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Device Pulse
                    <Laptop className="h-4 w-4" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { device: 'HR Master Node', status: 'SYNCHRONIZED', time: 'Live' },
                   { device: 'Employee App (iOS)', status: 'ACTIVE', time: 'Live' },
                   { device: 'External API Gateway', status: 'STANDBY', time: '2m ago' },
                 ].map((d, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-[24px] bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className={cn("h-2 w-2 rounded-full", d.status === 'SYNCHRONIZED' ? "bg-emerald-500" : "bg-blue-500")} />
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-900 uppercase truncate">{d.device}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{d.status}</p>
                         </div>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">{d.time}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
