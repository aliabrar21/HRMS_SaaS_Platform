import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer } from '@/components/ui/drawer';
import { 
  LifeBuoy, Search, Filter, Loader2, MessageSquare, 
  Clock, ShieldCheck, TrendingUp, AlertCircle, 
  CheckCircle2, Users, History, ArrowUpRight,
  Zap, Activity, Sparkles, Send, 
  MoreVertical, Eye, Share2, Plus,
  Lightbulb, Heart, Headphones,
  Tag, Flag, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

// --- Types ---
interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: 'TECHNICAL' | 'PAYROLL' | 'FACILITIES' | 'HR' | 'OTHER';
  createdAt: string;
  employee: {
    name: string;
    department: string;
    avatar?: string;
  };
  assignedTo?: {
    name: string;
    avatar?: string;
  };
}

// --- Mock Data ---
const HELPDESK_SUMMARY = [
  { title: 'Total Tickets', value: '842', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '24 new today' },
  { title: 'Open Items', value: '14', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '8 Urgent cases' },
  { title: 'Resolved', value: '728', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '98.4% SLA met' },
  { title: 'Avg Response', value: '42m', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Optimal Speed' },
  { title: 'CSAT Score', value: '4.9/5', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Exceeding targets' },
  { title: 'System Health', value: '99.9%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'All services live' },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: '1', ticketId: 'TKT-2025-001', title: 'Laptop Screen Flickering', description: 'Secondary display flickering on high brightness. Model: M3 Max.',
    priority: 'URGENT', status: 'IN_PROGRESS', category: 'TECHNICAL',
    createdAt: new Date().toISOString(), employee: { name: 'Sarah Connor', department: 'Engineering' },
    assignedTo: { name: 'IT Support' }
  },
  {
    id: '2', ticketId: 'TKT-2025-002', title: 'Payroll Query May 2025', description: 'Mismatch in tax deduction for the current cycle.',
    priority: 'HIGH', status: 'OPEN', category: 'PAYROLL',
    createdAt: new Date().toISOString(), employee: { name: 'James Holden', department: 'Operations' }
  },
  {
    id: '3', ticketId: 'TKT-2024-112', title: 'VPN Access Denied', description: 'Unable to connect to the production VPN tunnel.',
    priority: 'MEDIUM', status: 'RESOLVED', category: 'TECHNICAL',
    createdAt: new Date().toISOString(), employee: { name: 'Naomi Nagata', department: 'Engineering' },
    assignedTo: { name: 'IT Admin' }
  },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Technical', value: 45, color: '#6366f1' },
  { name: 'Payroll', value: 25, color: '#f59e0b' },
  { name: 'Facilities', value: 15, color: '#10b981' },
  { name: 'HR', value: 15, color: '#ec4899' },
];

export function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('/api/helpdesk/tickets');
        if (response.data.success && response.data.data.length > 0) {
           // Map backend data to our premium interface
           setTickets(response.data.data.map((t: any) => ({
             ...t,
             ticketId: `TKT-${t.id.slice(0,4)}`,
             employee: { name: `${t.employee.firstName} ${t.employee.lastName}`, department: 'General' },
             category: t.category || 'TECHNICAL',
           })));
        } else {
          setTickets(MOCK_TICKETS);
        }
      } catch (error) {
        setTickets(MOCK_TICKETS);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const getPriorityStyle = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'HIGH': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'MEDIUM': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'LOW': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getStatusStyle = (status: Ticket['status']) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'OPEN': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'CLOSED': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Resolution Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Resolution Hub</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Headphones className="h-4 w-4 text-indigo-500" />
            Support Terminal • SLA Protection • Automated Dispatch
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <History className="h-4 w-4" /> Support History
          </Button>
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none"
          >
            <Plus className="mr-2 h-4 w-4" /> Raise Ticket
          </Button>
        </div>
      </div>

      {/* 2. Support KPIs */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {HELPDESK_SUMMARY.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden group hover:translate-y-[-4px] transition-all">
              <CardContent className="p-6 flex flex-col h-full">
                <div className={cn("h-12 w-12 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:rotate-12", stat.bg, stat.color)}>
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

      {/* 3. Operational Queue */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Ticket List */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-black tracking-tight text-slate-900">Active Queue</h2>
                 <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Flow</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative group min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      placeholder="Search ticket ID, title..." 
                      className="h-11 pl-11 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="h-11 rounded-2xl px-5 gap-2 border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"><Filter className="h-4 w-4" /> Filter</Button>
              </div>
           </div>

           <div className="grid gap-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                   <div className="h-16 w-16 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Support Feed...</p>
                </div>
              ) : (
                tickets.map((ticket, idx) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden group hover:shadow-indigo-100/50 transition-all border border-slate-50">
                      <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "h-16 w-16 rounded-[24px] bg-slate-50 flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500",
                            ticket.priority === 'URGENT' && "border-rose-200"
                          )}>
                             <MessageSquare className="h-8 w-8" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                               <p className="text-lg font-black text-slate-900 leading-none">{ticket.title}</p>
                               <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", getPriorityStyle(ticket.priority))}>
                                  {ticket.priority}
                               </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {ticket.ticketId}</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> {ticket.category}</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {format(new Date(ticket.createdAt), 'dd MMM')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-10">
                           <div className="flex justify-center">
                              <span className={cn(
                                 "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border",
                                 getStatusStyle(ticket.status)
                              )}>
                                 {ticket.status === 'RESOLVED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                                 {ticket.status}
                              </span>
                           </div>

                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requestor</p>
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                    {ticket.employee.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{ticket.employee.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{ticket.employee.department}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600"><Eye className="h-5 w-5" /></Button>
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-slate-100"><MoreVertical className="h-5 w-5" /></Button>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        {/* Side Intelligence */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Domain Health
                    <Headphones className="h-5 w-5 text-indigo-600" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={CATEGORY_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                          >
                             {CATEGORY_DISTRIBUTION.map((entry, index) => (
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
                    {CATEGORY_DISTRIBUTION.map(item => (
                       <div key={item.name} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="h-1.5 w-8 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                          <p className="text-lg font-black text-slate-900 leading-none">{item.value}%</p>
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
                    <h3 className="text-2xl font-black">AI Resolution Beta</h3>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">
                       Automatically suggest fixes for common technical and payroll queries based on historical data.
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white">
                    Activate Smart Fix
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">CSAT Highlights</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { user: 'Sarah Connor', comment: 'Instant resolution on laptop issue!', stars: 5, time: '10m ago' },
                   { user: 'James Holden', comment: 'Helpful and fast payroll fix.', stars: 5, time: '1h ago' },
                 ].map((log, i) => (
                   <div key={i} className="p-4 rounded-[28px] bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[8px] font-black text-indigo-600">{log.user.charAt(0)}</div>
                            <span className="text-[9px] font-black text-slate-900 uppercase">{log.user}</span>
                         </div>
                         <div className="flex gap-0.5">
                            {[...Array(log.stars)].map((_, i) => <Star key={i} className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />)}
                         </div>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 italic">"{log.comment}"</p>
                      <p className="text-[8px] font-black text-slate-300 uppercase">{log.time}</p>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

// Re-importing Star for the CSAT highlights
import { Star } from 'lucide-react';
