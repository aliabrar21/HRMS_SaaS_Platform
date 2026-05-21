import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer } from '@/components/ui/drawer';
import { 
  Plus, Search, Filter, Loader2, Calendar as CalendarIcon, 
  Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  MoreHorizontal, Download, Users, History, CalendarDays,
  FileText, TrendingUp, AlertCircle, Info, ArrowUpRight,
  ShieldCheck, Eye, MoreVertical, Archive,
  Mail, CheckSquare, Square, BarChart3, PieChart as PieChartIcon,
  Activity, Bell, Settings, Flame, Zap, Sparkles, BrainCircuit,
  Calculator, MousePointer2, Briefcase, UserCircle, LogOut,
  ArrowRight, SearchIcon, FilterX
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

// --- Types & Mock Data ---
interface LeaveCardData {
  id: string;
  label: string;
  subtitle: string;
  accrual: string;
  total: number;
  used: number;
  color: string;
  formula: string;
  icon: any;
}

interface EmployeeUsage {
  id: string;
  name: string;
  avatar: string;
  department: string;
  used: number;
  remaining: number;
  lastTaken: string;
}

export function LeavePage() {
  const navigate = useNavigate();
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaveCards, setLeaveCards] = useState<LeaveCardData[]>([]);
  const [employeeUsage, setEmployeeUsage] = useState<Record<string, EmployeeUsage[]>>({});
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, requestsRes] = await Promise.all([
          axios.get('/api/leave/analytics'),
          axios.get('/api/leave')
        ]);

        if (analyticsRes.data.success) {
          const { cards, employeeUsage, trends } = analyticsRes.data.data;
          const mappedCards = cards.map((c: any) => ({
            ...c,
            subtitle: c.label.includes('Leave') ? 'Official Leave Policy' : 'Workforce Category',
            accrual: '1.5 / Month',
            formula: `${c.total} ÷ 12 = ${(c.total / 12).toFixed(1)}/mo`,
            icon: c.label.toLowerCase().includes('sick') ? Activity : CalendarIcon
          }));
          setLeaveCards(mappedCards);
          setEmployeeUsage(employeeUsage);
          setTrends(trends);
          if (mappedCards.length > 0 && !selectedLeaveId) {
            setSelectedLeaveId(mappedCards[0].id);
          }
        }

        if (requestsRes.data.success) {
          setPendingRequests(requestsRes.data.data.filter((r: any) => r.status === 'PENDING'));
        }
      } catch (error) {
        console.error('Error fetching leave analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/leave/${id}/status`, { status });
      setPendingRequests(prev => prev.filter(r => r.id !== id));
      
      const analyticsRes = await axios.get('/api/leave/analytics');
      if (analyticsRes.data.success) {
        setLeaveCards(analyticsRes.data.data.cards.map((c: any) => ({
          ...c,
          subtitle: c.label.includes('Leave') ? 'Official Leave Policy' : 'Workforce Category',
          accrual: '1.5 / Month',
          formula: `${c.total} ÷ 12 = ${(c.total / 12).toFixed(1)}/mo`,
          icon: c.label.toLowerCase().includes('sick') ? Activity : CalendarIcon
        })));
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  const selectedLeave = useMemo(() => 
    leaveCards.find(c => c.id === selectedLeaveId) || leaveCards[0],
    [selectedLeaveId, leaveCards]
  );

  const handleCardClick = (id: string) => {
    setSelectedLeaveId(id);
    setIsDetailDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-700">
      {/* 1. Premium Hero Header */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
         
         <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10"
               >
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                  Workforce Strategic Overview
               </motion.div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                  Leave <span className="text-indigo-400">Intelligence</span> Terminal
               </h1>
               <p className="text-lg font-medium text-slate-400 max-w-lg leading-relaxed">
                  Real-time monitoring of organizational burnout patterns, leave accruals, and workforce capacity analytics.
               </p>
            </div>
            
            <div className="flex gap-4">
               <div className="h-32 w-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 flex flex-col justify-between">
                  <Users className="h-6 w-6 text-indigo-400" />
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">On Leave</p>
                     <p className="text-2xl font-black tracking-tight">12%</p>
                  </div>
               </div>
               <div className="h-32 w-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 flex flex-col justify-between">
                  <Activity className="h-6 w-6 text-emerald-400" />
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Burnout</p>
                     <p className="text-2xl font-black tracking-tight text-emerald-400">Low</p>
                  </div>
               </div>
            </div>
         </div>
      </section>


      {/* 3. Policy & Intelligence Grid */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Policy Intelligence</h2>
            <Button 
              onClick={() => setIsApplyDrawerOpen(true)}
              className="h-11 px-8 rounded-2xl bg-slate-900 text-white shadow-xl hover:scale-105 transition-transform font-black uppercase text-xs tracking-widest"
            >
               Request Leave
            </Button>
         </div>
         
         <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            {leaveCards.map((card, index) => (
               <motion.div
                 key={card.id}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: index * 0.05 }}
                 className="min-w-[300px] flex-shrink-0 snap-start"
               >
                  <Card 
                    className={cn(
                      "relative border-none shadow-2xl rounded-[32px] overflow-hidden transition-all duration-500 group cursor-pointer hover:-translate-y-2 bg-white",
                      selectedLeaveId === card.id ? "ring-2 ring-indigo-500 scale-105" : "hover:shadow-indigo-100/50"
                    )}
                    onClick={() => {
                      setSelectedLeaveId(card.id);
                      setIsDetailDrawerOpen(true);
                    }}
                  >
                     <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                           <div className={cn(
                             "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                             card.label.includes('Sick') ? "bg-blue-500 shadow-blue-100" :
                             card.label.includes('Loss') ? "bg-rose-500 shadow-rose-100" :
                             card.label.includes('Earned') ? "bg-amber-500 shadow-amber-100" :
                             card.label.includes('Comp') ? "bg-emerald-500 shadow-emerald-100" : "bg-indigo-500 shadow-indigo-100"
                           )}>
                              <card.icon className="h-6 w-6" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                              {card.accrual}
                           </span>
                        </div>
                        
                        <div className="space-y-1 mb-8">
                           <h3 className="text-lg font-black text-slate-900 leading-none">{card.label}</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.subtitle}</p>
                        </div>
                        
                        <div className="flex items-end gap-1.5 mb-2">
                           <span className="text-4xl font-black tracking-tighter text-slate-900">{card.total - card.used}</span>
                           <span className="text-sm font-bold text-slate-400 pb-1.5">/ {card.total}d</span>
                        </div>
                        
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${((card.total - card.used) / card.total) * 100}%` }}
                             className={cn("h-full rounded-full", card.label.includes('Loss') ? "bg-rose-500" : "bg-indigo-500")}
                           />
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                           <Calculator className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500" />
                           <span className="text-[10px] font-black text-slate-500 group-hover:text-indigo-600 tracking-tighter">{card.formula}</span>
                           <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                        </div>
                     </CardContent>
                  </Card>
               </motion.div>
            ))}
         </div>
      </div>

      {/* 4. Analytics & Pulse */}
      <div className="space-y-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
         >
            <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-100">
               <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 flex items-center justify-center text-white">
                        <Users className="h-6 w-6" />
                     </div>
                     <div>
                        <CardTitle className="text-xl font-black text-slate-900">Workforce Approval Desk</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                           Strategic Leave Verification & Operational Control
                        </CardDescription>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <div className={cn("h-2 w-2 rounded-full", pendingRequests.length > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                           {pendingRequests.length > 0 ? `${pendingRequests.length} Pending` : 'System Clear'}
                        </span>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {pendingRequests.length > 0 ? (
                     <div className="divide-y divide-slate-50">
                        {pendingRequests.map((request, idx) => (
                           <motion.div 
                             key={request.id}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.05 }}
                             className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-indigo-50/30 transition-colors group"
                           >
                              <div className="flex items-center gap-6 flex-1 min-w-0">
                                 <div className="h-16 w-16 rounded-[24px] bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-lg border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 uppercase">
                                    {request.employee.firstName.charAt(0)}{request.employee.lastName.charAt(0)}
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                       <p className="text-lg font-black text-slate-900 leading-none">{request.employee.firstName} {request.employee.lastName}</p>
                                       <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                          {request.leaveType.name}
                                       </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                       {request.employee.department?.name || 'Operations'} • {request.employee.employeeCode}
                                    </p>
                                 </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-12">
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Period</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                                       <CalendarDays className="h-4 w-4 text-indigo-400" />
                                       {format(new Date(request.fromDate), 'MMM dd')} — {format(new Date(request.toDate), 'MMM dd')}
                                    </div>
                                 </div>

                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity Impact</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-rose-500">
                                       <Activity className="h-4 w-4" />
                                       {request.totalDays} Strategic Days
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-3">
                                    <Button 
                                      onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                      className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white font-black uppercase text-[10px] tracking-widest border-none"
                                    >
                                       Approve Leave
                                    </Button>
                                    <Button 
                                      onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                      variant="outline"
                                      className="h-12 px-8 rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                       Reject
                                    </Button>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-24 w-24 rounded-[40px] bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
                           <CheckSquare className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-black text-slate-900">Queue Fully Processed</h3>
                           <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
                              All employee leave requests have been strategically evaluated. No pending approvals required at this cycle.
                           </p>
                        </div>
                        <Button variant="outline" className="h-11 px-6 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                           Review Action History
                        </Button>
                     </div>
                  )}
               </CardContent>
            </Card>
         </motion.div>

         <div className="grid gap-8 lg:grid-cols-12">
            <Card className="lg:col-span-8 border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
               <CardHeader className="p-8 border-b border-slate-50">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                           <TrendingUp className="h-5 w-5" />
                        </div>
                        Consumption Patterns
                     </CardTitle>
                     <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                           <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                           Live Feed
                        </span>
                     </div>
                  </div>
               </CardHeader>
            <CardContent className="p-8">
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={trends}>
                        <defs>
                           <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                           <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="earned" stroke="#10b981" strokeWidth={3} fill="url(#colorEarned)" />
                        <Area type="monotone" dataKey="used" stroke="#6366f1" strokeWidth={4} fill="url(#colorUsed)" />
                     </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
         </Card>
         
         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[40px] p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <div className="relative space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                     <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-black">Attrition Risk</h3>
                     <p className="text-xs font-medium text-white/80 leading-relaxed">
                        High leave utilization detected in Engineering. Consider workforce re-allocation.
                     </p>
                  </div>
                  <Button variant="ghost" className="w-full justify-between rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase px-6 text-white">
                     Deep Dive Analytics
                     <ChevronRight className="h-4 w-4" />
                  </Button>
               </div>
            </Card>

            <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
               <CardHeader className="px-8 pt-8 pb-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Quick Insights</CardTitle>
               </CardHeader>
               <CardContent className="px-8 pb-8 space-y-4">
                  {[
                    { label: 'Longest Holiday', value: 'Dec 2025', icon: CalendarIcon, color: 'text-blue-500' },
                    { label: 'Avg. Leave Duration', value: '4.2 Days', icon: Clock, color: 'text-amber-500' },
                    { label: 'Approval Rate', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100">
                       <div className="flex items-center gap-3">
                          <item.icon className={cn("h-4 w-4", item.color)} />
                          <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{item.label}</span>
                       </div>
                       <span className="text-xs font-black text-slate-900">{item.value}</span>
                    </div>
                  ))}
               </CardContent>
            </Card>
         </div>
      </div>
   </div>
      
      {/* 5. Drawers */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title={`${selectedLeave?.label || 'Leave'} Usage Intelligence`}
        description={`Analyzing workforce allocation for ${selectedLeave?.label?.toLowerCase() || 'selected'} policy.`}
      >
        <div className="pb-32 px-4 space-y-8">
           <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Allocated</p>
                 <p className="text-2xl font-black text-slate-900">{selectedLeave?.total || 0}d</p>
              </div>
              <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-100">
                 <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Used</p>
                 <p className="text-2xl font-black text-indigo-600">{selectedLeave?.used || 0}d</p>
              </div>
              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100">
                 <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Available</p>
                 <p className="text-2xl font-black text-emerald-600">{(selectedLeave?.total || 0) - (selectedLeave?.used || 0)}d</p>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Workforce Breakdown</h4>
              <div className="grid gap-4">
                 {(employeeUsage[selectedLeaveId || ''] || []).map((emp, i) => (
                    <motion.div 
                      key={emp.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex items-center justify-between"
                    >
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             {emp.avatar}
                          </div>
                          <div>
                             <p className="text-base font-black text-slate-900 leading-tight">{emp.name}</p>
                             <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                   <Users className="h-3 w-3" /> {emp.department}
                                </span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right space-y-2">
                          <div className="flex items-center justify-end gap-3">
                             <span className="text-base font-black text-slate-900">{emp.used}d Used</span>
                             <span className="text-xs font-bold text-slate-400">/ {emp.remaining}d Left</span>
                          </div>
                          <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full rounded-full bg-indigo-500" 
                               style={{ width: `${(emp.used / (emp.used + emp.remaining)) * 100}%` }} 
                             />
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex gap-4">
           <Button variant="ghost" className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest" onClick={() => setIsDetailDrawerOpen(false)}>Close View</Button>
           <Button className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest text-white">Export Analysis</Button>
        </div>
      </Drawer>

      <Drawer
        isOpen={isApplyDrawerOpen}
        onClose={() => setIsApplyDrawerOpen(false)}
        title="Leave Configuration"
        description="Configure parameters for the new leave application."
      >
        <div className="px-4 pb-32 space-y-8">
           <p className="text-sm font-bold text-slate-500">Standard application workflow will render here...</p>
           <Button onClick={() => setIsApplyDrawerOpen(false)} className="h-14 w-full rounded-2xl bg-indigo-600 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-100">Commit Request</Button>
        </div>
      </Drawer>
    </div>
  );
}
