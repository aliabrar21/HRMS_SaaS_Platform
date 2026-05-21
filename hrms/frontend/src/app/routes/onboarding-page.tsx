import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, FileCheck, ShieldAlert, CreditCard, 
  Laptop, CheckCircle2, Search, Filter, 
  Bell, MoreHorizontal, ChevronRight, 
  Clock, AlertCircle, TrendingUp, ArrowUpRight,
  UserPlus, Mail, FileText, CheckCircle,
  Activity, Calendar, Settings, Eye,
  ThumbsUp, ThumbsDown, History
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Types ---
interface OnboardingEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  doj: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'AWAITING_HR' | 'AWAITING_EMPLOYEE' | 'COMPLETED' | 'BLOCKED';
  progress: number;
  avatar?: string;
}

interface ActivityLog {
  id: string;
  time: string;
  user: string;
  action: string;
  type: 'UPLOAD' | 'APPROVAL' | 'SIGN' | 'ASSET';
}

// --- Mock Data ---
const SUMMARY_STATS = [
  { title: 'New Joiners', value: 14, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+4 this week' },
  { title: 'Pending Docs', value: 9, icon: FileCheck, color: 'text-amber-600', bg: 'bg-amber-50', trend: '3 high priority' },
  { title: 'NDA Pending', value: 4, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', trend: 'Compliance risk' },
  { title: 'Payroll Pending', value: 3, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Finance blocker' },
  { title: 'IT Assets', value: 5, icon: Laptop, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Logistics needed' },
  { title: 'Completed', value: 22, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '92% success rate' },
];

const RECENT_JOINERS: OnboardingEmployee[] = [
  { id: '1', firstName: 'Sarah', lastName: 'Connor', email: 'sarah.c@acme.com', department: 'Engineering', doj: '2025-06-01', status: 'IN_PROGRESS', progress: 65 },
  { id: '2', firstName: 'James', lastName: 'Holden', email: 'j.holden@acme.com', department: 'Operations', doj: '2025-06-05', status: 'AWAITING_HR', progress: 85 },
  { id: '3', firstName: 'Naomi', lastName: 'Nagata', email: 'n.nagata@acme.com', department: 'Engineering', doj: '2025-05-28', status: 'COMPLETED', progress: 100 },
  { id: '4', firstName: 'Amos', lastName: 'Burton', email: 'a.burton@acme.com', department: 'Security', doj: '2025-06-10', status: 'AWAITING_EMPLOYEE', progress: 40 },
  { id: '5', firstName: 'Chrisjen', lastName: 'Avasarala', email: 'chrisjen@acme.com', department: 'Legal', doj: '2025-06-12', status: 'BLOCKED', progress: 20 },
];

const ANALYTICS_DATA = [
  { name: 'Mon', completed: 2, total: 5 },
  { name: 'Tue', completed: 4, total: 6 },
  { name: 'Wed', completed: 3, total: 8 },
  { name: 'Thu', completed: 7, total: 10 },
  { name: 'Fri', completed: 5, total: 7 },
];

const RECENT_ACTIVITY: ActivityLog[] = [
  { id: '1', time: '10:32 AM', user: 'Sarah Connor', action: 'Uploaded PAN Card', type: 'UPLOAD' },
  { id: '2', time: '11:02 AM', user: 'Admin (You)', action: 'Approved Bank Details', type: 'APPROVAL' },
  { id: '3', time: '12:45 PM', user: 'James Holden', action: 'Signed NDA', type: 'SIGN' },
  { id: '4', time: '02:15 PM', user: 'IT Support', action: 'Assigned MacBook Pro', type: 'ASSET' },
];

export function OnboardingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: OnboardingEmployee['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'AWAITING_HR': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'AWAITING_EMPLOYEE': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'BLOCKED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="pb-10 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Onboarding Center</h1>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Managing <span className="text-slate-900">14 active employees</span> across 6 departments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search joiners..." 
              className="h-10 w-[240px] pl-10 bg-white border-slate-200 rounded-xl focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Joiner
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {SUMMARY_STATS.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white">
              <CardContent className="p-4">
                <div className={cn("p-2 w-fit rounded-lg mb-3 transition-colors", stat.bg, stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{stat.title}</h3>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <p className="text-[9px] font-bold text-slate-400 mt-1 truncate">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content: Table & Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Analytics Chart */}
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-5">
                <div>
                   <CardTitle className="text-lg font-black">Onboarding Velocity</CardTitle>
                   <CardDescription className="text-xs font-bold text-slate-400">Weekly completion vs onboarding starts</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-black uppercase tracking-wider">
                  Details <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
             </CardHeader>
             <CardContent className="p-8">
                <div className="h-[240px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ANALYTICS_DATA}>
                         <defs>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94a3b8' }} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94a3b8' }} />
                         <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                         <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fill="none" name="New Starts" />
                         <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" name="Completed" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </CardContent>
          </Card>

          {/* Employee Table */}
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-xl font-black">Active Onboarding</CardTitle>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-9 rounded-xl font-bold text-xs"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Employee</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Department</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Join Date</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Status</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400">Progress</th>
                          <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {RECENT_JOINERS.map((emp) => (
                          <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-2xl bg-slate-100 border flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                     {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-sm font-black text-slate-900 truncate">{emp.firstName} {emp.lastName}</p>
                                     <p className="text-[10px] font-bold text-slate-400 truncate w-32">{emp.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-5">
                               <span className="text-xs font-bold text-slate-600">{emp.department}</span>
                            </td>
                            <td className="px-8 py-5">
                               <span className="text-xs font-bold text-slate-600">{format(new Date(emp.doj), 'MMM dd, yyyy')}</span>
                            </td>
                            <td className="px-8 py-5">
                               <span className={cn(
                                 "inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border",
                                 getStatusColor(emp.status)
                               )}>
                                 {emp.status.replace('_', ' ')}
                               </span>
                            </td>
                            <td className="px-8 py-5">
                               <div className="w-24 space-y-1.5">
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${emp.progress}%` }}
                                       className={cn(
                                         "h-full rounded-full",
                                         emp.progress === 100 ? "bg-emerald-500" : "bg-primary"
                                       )}
                                     />
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                     <span>{emp.progress}%</span>
                                     {emp.progress === 100 && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TooltipProvider>
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10">
                                              <Eye className="h-4 w-4" />
                                           </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p className="text-[10px] font-bold uppercase">View Profile</p></TooltipContent>
                                     </Tooltip>
                                  </TooltipProvider>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900">
                                     <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </CardContent>
             <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 1 of 3</span>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider" disabled>Previous</Button>
                   <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider">Next</Button>
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar: Approvals & Activity */}
        <div className="lg:col-span-4 space-y-6">
           {/* Pending Approvals */}
           <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-white/5">
                 <CardTitle className="text-base font-black flex items-center justify-between">
                    Pending Approvals
                    <span className="h-5 w-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center border-2 border-slate-900">3</span>
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-white/5">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="p-5 space-y-4 hover:bg-white/5 transition-colors group">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs uppercase">JH</div>
                                <div>
                                   <p className="text-xs font-black text-white">James Holden</p>
                                   <p className="text-[9px] font-bold text-white/50 uppercase tracking-tighter">Bank Details Verification</p>
                                </div>
                             </div>
                             <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button className="h-8 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-[9px] uppercase tracking-wider">
                                <ThumbsUp className="mr-1.5 h-3 w-3" /> Approve
                             </Button>
                             <Button variant="ghost" className="h-8 flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-black text-[9px] uppercase tracking-wider">
                                <ThumbsDown className="mr-1.5 h-3 w-3" /> Reject
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
              <div className="p-4 text-center border-t border-white/5">
                 <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                    View All Pending
                 </Button>
              </div>
           </Card>

           {/* Activity Timeline */}
           <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-50">
                 <CardTitle className="text-base font-black flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Onboarding Audit
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    {RECENT_ACTIVITY.map((log) => (
                       <div key={log.id} className="relative pl-8 space-y-1">
                          <div className={cn(
                            "absolute left-0 top-1 h-6 w-6 rounded-lg flex items-center justify-center shadow-sm z-10",
                            log.type === 'UPLOAD' ? 'bg-blue-50 text-blue-600' :
                            log.type === 'APPROVAL' ? 'bg-emerald-50 text-emerald-600' :
                            log.type === 'SIGN' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                          )}>
                             {log.type === 'UPLOAD' && <FileText className="h-3 w-3" />}
                             {log.type === 'APPROVAL' && <CheckCircle className="h-3 w-3" />}
                             {log.type === 'SIGN' && <ShieldAlert className="h-3 w-3" />}
                             {log.type === 'ASSET' && <Laptop className="h-3 w-3" />}
                          </div>
                          <div className="flex items-center justify-between">
                             <p className="text-xs font-black text-slate-900">{log.user}</p>
                             <span className="text-[9px] font-bold text-slate-400 uppercase">{log.time}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{log.action}</p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Missing Data Alert */}
           <Card className="border-none shadow-xl bg-red-600 text-white rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                       <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                       <p className="text-sm font-black">Critical Blockers</p>
                       <p className="text-[10px] font-bold text-white/70 uppercase">Action required immediately</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-white/10 text-[10px] font-bold leading-relaxed">
                       Chrisjen Avasarala has not signed the NDA. Joining date is tomorrow.
                    </div>
                 </div>
                 <Button className="w-full h-10 rounded-xl bg-white text-red-600 hover:bg-white/90 font-black text-xs uppercase tracking-wider">
                    Send Reminder
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
