import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, Download, Filter, Loader2, ChevronLeft, 
  ChevronRight, Plus, Search, Activity, Target,
  TrendingUp, ArrowUpRight, ShieldCheck, MapPin,
  Clock, Users, Layout, Sparkles, MoreVertical,
  History, Calendar, Bell
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { format, subDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { AttendanceAnalyticsDrawer } from '@/components/attendance/attendance-analytics-drawer';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// --- Types ---
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

interface AttendanceLog {
  id: string;
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'WEEKOFF' | 'HOLIDAY' | 'LEAVE';
  employee: Employee;
  checkInAt?: string;
  checkOutAt?: string;
}

// --- Mock Data ---
const ATTENDANCE_KPI = [
  { title: 'Global Presence', value: '94.2%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '382 active today' },
  { title: 'Avg Clock-In', value: '09:14 AM', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'On target' },
  { title: 'Late Arrivals', value: '12', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: '3 critical delays' },
  { title: 'OT Generated', value: '142h', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', trend: '₹2.4L Projected' },
  { title: 'Remote Ratio', value: '64%', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Hybrid Dominant' },
  { title: 'Compliance', value: '99.9%', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Audit Ready' },
];

const SHIFT_DISTRIBUTION = [
  { name: 'General', value: 340, color: '#6366f1' },
  { name: 'Night', value: 45, color: '#f59e0b' },
  { name: 'Morning', value: 43, color: '#10b981' },
];

export function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: string;
    status: string;
  } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = async (employeeId: string, date: string, status: string) => {
    try {
      setAnalyticsLoading(true);
      setDrawerOpen(true);
      setSelectedCell({ employeeId, date, status });
      const response = await axios.get(`/api/attendance/analytics?employeeId=${employeeId}&date=${date}`);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const response = await axios.get(`/api/attendance?month=${month}&year=${year}`);
        if (response.data.success) {
          setLogs(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch attendance', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group logs by employee
  const employeeMap = new Map<string, { employee: Employee, logs: Record<string, AttendanceLog> }>();
  logs.forEach(log => {
    if (!employeeMap.has(log.employeeId)) {
      employeeMap.set(log.employeeId, { employee: log.employee, logs: {} });
    }
    const dateStr = new Date(log.date).toISOString().split('T')[0];
    employeeMap.get(log.employeeId)!.logs[dateStr] = log;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500';
      case 'ABSENT': return 'bg-rose-500';
      case 'HALF_DAY': return 'bg-amber-500';
      case 'LEAVE': return 'bg-blue-500';
      case 'WEEKOFF': return 'bg-slate-200';
      case 'HOLIDAY': return 'bg-violet-500';
      default: return 'bg-slate-100';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'PRESENT': return 'P';
      case 'ABSENT': return 'A';
      case 'HALF_DAY': return 'HD';
      case 'LEAVE': return 'L';
      case 'WEEKOFF': return 'W';
      case 'HOLIDAY': return 'H';
      default: return '-';
    }
  };

  const prevMonth = () => setCurrentDate(subDays(currentDate, 30));
  const nextMonth = () => setCurrentDate(addDays(currentDate, 30));

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Hero Upgrade */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Presence Hub</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Activity className="h-4 w-4 text-emerald-500" />
            Live Workforce Monitoring • Geo-Spatial Tracking • Attendance Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <Download className="h-4 w-4" /> Export Report
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Mark Attendance
          </Button>
        </div>
      </div>

      {/* 2. KPI Pulse Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {ATTENDANCE_KPI.map((stat, idx) => (
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
                   <Target className="h-3 w-3" /> {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 3. Main Operational Interface */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Heatmap Area */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-black tracking-tight text-slate-900">Heatmap Ledger</h2>
                 <div className="flex items-center rounded-2xl border-2 border-slate-100 bg-white p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="px-4 text-[10px] font-black uppercase tracking-widest min-w-[140px] text-center">{format(currentDate, 'MMMM yyyy')}</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative group min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      placeholder="Search name, code..." 
                      className="h-11 pl-11 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="h-11 rounded-2xl px-5 gap-2 border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"><Filter className="h-4 w-4" /> Legend</Button>
              </div>
           </div>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                             <th className="sticky left-0 z-20 bg-slate-50/50 px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-r shadow-lg">Employee Portfolio</th>
                             {daysInMonth.map(day => (
                                <th key={day.toString()} className={cn(
                                   "px-2 py-6 text-center text-[10px] font-black min-w-[42px] border-r border-slate-100/50",
                                   day.getDay() === 0 || day.getDay() === 6 ? 'bg-slate-100/50 text-slate-300' : 'text-slate-500'
                                )}>
                                   <div className="flex flex-col items-center">
                                      <span className="opacity-50">{format(day, 'EEE').charAt(0)}</span>
                                      <span className="text-xs mt-1">{format(day, 'd')}</span>
                                   </div>
                                </th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {loading ? (
                             <tr>
                                <td colSpan={daysInMonth.length + 1} className="py-48">
                                   <div className="flex flex-col items-center justify-center gap-4">
                                      <div className="h-12 w-12 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Presence Logs...</p>
                                   </div>
                                </td>
                             </tr>
                          ) : (
                             Array.from(employeeMap.values()).map(({ employee, logs }, idx) => (
                                <tr key={employee.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                   <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-8 py-4 border-r shadow-xl transition-colors">
                                      <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px] shadow-sm uppercase shrink-0 border border-indigo-100">
                                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                         </div>
                                         <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate">{employee.firstName} {employee.lastName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{employee.employeeCode}</p>
                                         </div>
                                      </div>
                                   </td>
                                   {daysInMonth.map(day => {
                                      const dateStr = day.toISOString().split('T')[0];
                                      const log = logs[dateStr];
                                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                      const status = log?.status || (isWeekend ? 'WEEKOFF' : undefined);

                                      return (
                                         <td key={day.toString()} className={cn("px-1 py-3 text-center border-r border-slate-50", isWeekend && "bg-slate-50/30")}>
                                            <TooltipProvider>
                                               <Tooltip delayDuration={0}>
                                                  <TooltipTrigger asChild>
                                                     <motion.div 
                                                       whileHover={{ scale: 1.2, zIndex: 30 }}
                                                       whileTap={{ scale: 0.9 }}
                                                       onClick={() => fetchAnalytics(employee.id, dateStr, status || '-')}
                                                       className={cn(
                                                         "mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black text-white shadow-sm cursor-pointer transition-all",
                                                         getStatusColor(status)
                                                       )}
                                                     >
                                                        {getStatusLabel(status)}
                                                     </motion.div>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="p-4 bg-slate-900 text-white border-none shadow-2xl rounded-3xl min-w-[180px]">
                                                     <div className="space-y-3">
                                                        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                                           <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-[10px] font-black">
                                                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                                           </div>
                                                           <div>
                                                              <p className="font-black text-xs leading-none">{employee.firstName} {employee.lastName}</p>
                                                              <p className="text-[9px] font-bold opacity-50 uppercase mt-1">{format(day, 'dd MMM yyyy')}</p>
                                                           </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                           <span className="text-[9px] font-black uppercase opacity-50">Status</span>
                                                           <span className="text-[9px] font-black uppercase tracking-widest">{status || 'PENDING'}</span>
                                                        </div>
                                                        {log?.checkInAt && (
                                                           <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                                              <div>
                                                                 <p className="text-[8px] font-black opacity-40 uppercase">Clock In</p>
                                                                 <p className="text-[10px] font-black">{format(new Date(log.checkInAt), 'hh:mm a')}</p>
                                                              </div>
                                                              <div>
                                                                 <p className="text-[8px] font-black opacity-40 uppercase">Clock Out</p>
                                                                 <p className="text-[10px] font-black">{log.checkOutAt ? format(new Date(log.checkOutAt), 'hh:mm a') : '--:--'}</p>
                                                              </div>
                                                           </div>
                                                        )}
                                                     </div>
                                                  </TooltipContent>
                                               </Tooltip>
                                            </TooltipProvider>
                                         </td>
                                      );
                                   })}
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Side Intelligence */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Shift Allocation
                    <PieChartIcon className="h-5 w-5 text-indigo-600" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={SHIFT_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                          >
                             {SHIFT_DISTRIBUTION.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.1)' }}
                             itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mt-8">
                    {SHIFT_DISTRIBUTION.map(item => (
                       <div key={item.name} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="h-1.5 w-8 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                          <p className="text-lg font-black text-slate-900 leading-none">{item.value}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-8">
                 <div className="h-16 w-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">AI Regularization</h3>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">
                       Automatically flag and suggest corrections for missing check-outs and abnormal clock-in patterns.
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white">
                    Audit Suggestions
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Upcoming Holidays
                    <Calendar className="h-4 w-4" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { event: 'Eid-ul-Fitr', date: 'May 12', type: 'NATIONAL' },
                   { event: 'Buddha Purnima', date: 'May 23', type: 'RESTRICTED' },
                 ].map((h, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-[28px] bg-slate-50 border border-slate-100 group">
                      <div className="flex items-center gap-4">
                         <div className="h-11 w-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                            <CalendarDays className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{h.event}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{h.type}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-indigo-600 uppercase">{h.date}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>

      <AttendanceAnalyticsDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employeeId={selectedCell?.employeeId || null}
        date={selectedCell?.date || null}
        status={selectedCell?.status || null}
        data={analyticsData}
        loading={analyticsLoading}
      />
    </div>
  );
}

// Re-importing PieChartIcon as simple PieChart was already used for the component
import { PieChart as PieChartIcon } from 'lucide-react';
