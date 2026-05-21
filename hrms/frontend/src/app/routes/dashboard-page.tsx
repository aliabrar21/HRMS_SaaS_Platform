import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { 
  Users, UserCheck, Palmtree, Briefcase, Activity, 
  CalendarClock, TrendingUp, ArrowUpRight, 
  ArrowDownRight, ShieldCheck, Zap, Sparkles,
  ChevronRight, MoreVertical, Search, Bell,
  Plus, Layout, Settings, Mail, Clock,
  PieChart as PieChartIcon, Target, Brain
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- Mock Data ---
const ATTENDANCE_TRENDS = [
  { name: 'Mon', present: 18, expected: 20 },
  { name: 'Tue', present: 19, expected: 20 },
  { name: 'Wed', present: 17, expected: 20 },
  { name: 'Thu', present: 20, expected: 20 },
  { name: 'Fri', present: 18, expected: 20 },
];

const DEPT_DISTRIBUTION = [
  { name: 'Engineering', value: 8, color: '#6366f1' },
  { name: 'Sales', value: 4, color: '#3b82f6' },
  { name: 'Marketing', value: 3, color: '#10b981' },
  { name: 'HR', value: 2, color: '#f59e0b' },
  { name: 'Finance', value: 3, color: '#ec4899' },
];

const DASHBOARD_KPIS = [
  { title: 'Global Headcount', value: '428', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+14% YOY' },
  { title: 'Presence Today', value: '94.2%', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '382 active' },
  { title: 'Monthly Burn', value: '₹4.2Cr', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', trend: '-2% Optimization' },
  { title: 'Talent Pipeline', value: '142', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', trend: '12 for interview' },
  { title: 'Retention Rate', value: '98.4%', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Target: 95%' },
  { title: 'System Status', value: 'Nominal', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'p99 Health' },
];

const RECENT_FEED = [
  { user: 'Priya Verma', action: 'Leave Request Approved', time: '2h ago', icon: Palmtree, color: 'text-amber-500' },
  { user: 'Rohan Iyer', action: 'Onboarding Completed', time: '5h ago', icon: UserCheck, color: 'text-emerald-500' },
  { user: 'Finance Bot', action: 'Payroll Run Finalized', time: 'Yesterday', icon: Activity, color: 'text-indigo-500' },
  { user: 'System Admin', action: 'Security Patch v2.4', time: '2d ago', icon: ShieldCheck, color: 'text-rose-500' },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user) || { firstName: 'User', lastName: '' };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Personalized Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tight text-slate-900">Welcome back, {user.firstName}</h1>
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5"
             >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Live Terminal</span>
             </motion.div>
          </div>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Layout className="h-4 w-4 text-indigo-500" />
            Operational Intelligence Dashboard • May 2025 Cycle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group min-w-[200px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input placeholder="Global Search..." className="h-12 pl-12 pr-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all text-sm font-medium w-full" />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 border-slate-100 relative">
             <Bell className="h-5 w-5 text-slate-500" />
             <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
          </Button>
        </div>
      </div>

      {/* 2. Executive Metrics Pulse */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {DASHBOARD_KPIS.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all">
              <CardContent className="p-6 flex flex-col h-full">
                <div className={cn("h-12 w-12 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:rotate-12 shadow-sm", stat.bg, stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">{stat.title}</h3>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                   <Activity className="h-3 w-3" /> {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 3. Operational HQ */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Analytics Area */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900">
                       <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Activity className="h-5 w-5" />
                       </div>
                       HQ Presence Analytics
                    </CardTitle>
                    <div className="flex items-center gap-2">
                       <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest border-2">Last 7 Days</Button>
                       <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest border-2">Export</Button>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ATTENDANCE_TRENDS}>
                          <defs>
                             <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} />
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                             itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                          />
                          <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={4} fill="url(#colorPresence)" />
                          <Area type="monotone" dataKey="expected" stroke="#cbd5e1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[40px] overflow-hidden group">
                 <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white/50 flex items-center justify-between">
                       Department Matrix
                       <PieChartIcon className="h-4 w-4 text-indigo-400" />
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8">
                    <div className="h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie
                               data={DEPT_DISTRIBUTION}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={8}
                               dataKey="value"
                             >
                                {DEPT_DISTRIBUTION.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                             </Pie>
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                       {DEPT_DISTRIBUTION.map(dept => (
                          <div key={dept.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                             <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-tight text-white/90 truncate">{dept.name}</p>
                                <p className="text-[9px] font-bold text-white/40 uppercase">{dept.value} Active</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
                 <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                       Smart Shortcuts
                       <Sparkles className="h-4 w-4 text-indigo-500" />
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-4">
                    {[
                      { label: 'Provision Asset', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Run Payroll Cycle', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Issue Offer Letter', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Compliance Audit', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map((btn, i) => (
                      <Button key={i} variant="ghost" className="w-full h-14 justify-between px-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl hover:translate-x-1 transition-all border border-transparent hover:border-slate-100 group">
                         <div className="flex items-center gap-4">
                            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", btn.bg, btn.color)}>
                               <btn.icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-700">{btn.label}</span>
                         </div>
                         <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" />
                      </Button>
                    ))}
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Sidebar: Pulse Feed & AI Insights */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Pulse Feed
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {RECENT_FEED.map((log, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-center justify-between p-4 rounded-[28px] bg-slate-50 border border-slate-100 group hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer"
                   >
                      <div className="flex items-center gap-4">
                         <div className={cn("h-11 w-11 rounded-2xl bg-white shadow-sm flex items-center justify-center", log.color)}>
                            <log.icon className="h-5 w-5" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.user}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate w-32">{log.action}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase whitespace-nowrap">{log.time}</span>
                   </motion.div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-8">
                 <div className="h-16 w-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black">Predictive Insights</h3>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/5">
                          <Plus className="h-4 w-4 text-emerald-300" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/90">4 New Joiners in 15 days</span>
                       </div>
                       <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/5">
                          <Target className="h-4 w-4 text-amber-300" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/90">2 Anniversaries tomorrow</span>
                       </div>
                    </div>
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white">
                    View Planner
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] p-8 overflow-hidden border border-slate-50">
              <div className="flex items-center justify-between mb-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Policy Compliance</p>
                 <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                       <span className="text-slate-900">Tax Readiness</span>
                       <span className="text-indigo-600">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-indigo-600 rounded-full" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                       <span className="text-slate-900">Audit Documentation</span>
                       <span className="text-emerald-600">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500 rounded-full" />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
