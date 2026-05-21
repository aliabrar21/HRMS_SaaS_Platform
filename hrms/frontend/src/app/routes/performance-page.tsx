import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Target, Search, Filter, Loader2, Star, TrendingUp, 
  Users, Award, BarChart3, PieChart as PieChartIcon, 
  Activity, Bell, Zap, BrainCircuit, ChevronRight,
  MoreHorizontal, Download, ArrowUpRight, Flame,
  ShieldCheck, CheckCircle2, AlertCircle, Clock,
  Trophy, TrendingDown, LayoutDashboard, Flag,
  UserCircle, MessageSquare, Briefcase, ZapIcon
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceReview {
  id: string;
  status: string;
  overallRating: number;
  employee: { firstName: string; lastName: string; employeeCode: string; avatar?: string; department?: { name: string }; designation?: { name: string } };
  manager?: { firstName: string; lastName: string };
  reviewCycle: { name: string };
  createdAt: string;
}

interface AnalyticsData {
  stats: {
    avgRating: number;
    completionRate: number;
    goalCompletionPct: number;
    totalReviews: number;
    pendingReviews: number;
    attritionRisk: number;
  };
  distribution: { name: string; count: number; color: string }[];
  heatmap: { name: string; rating: number; risk: string }[];
  trends: { name: string; rating: number; completion: number }[];
  topPerformers: { id: string; name: string; rating: number; avatar?: string; dept?: string }[];
}

export function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, analyticsRes] = await Promise.all([
          axios.get('/api/performance/reviews'),
          axios.get('/api/performance/analytics')
        ]);
        
        if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch performance data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => 
      `${r.employee.firstName} ${r.employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employee.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reviews, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="relative">
           <div className="h-20 w-20 animate-spin rounded-[2.5rem] border-4 border-indigo-600 border-t-transparent shadow-2xl shadow-indigo-100" />
           <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-600 animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Performance Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-700">
      {/* 1. Premium Performance Hero */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-amber-600/10 blur-[100px]" />
         
         <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10"
               >
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  Enterprise Performance Intelligence
               </motion.div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                  Growth <span className="text-indigo-400">& Strategy</span> Terminal
               </h1>
               <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
                  Monitor workforce trajectory, review cycles, and strategic OKRs through a high-fidelity analytical lens.
               </p>
               
               <div className="flex flex-wrap items-center gap-4">
                  <Button className="h-14 px-8 rounded-2xl bg-indigo-500 hover:bg-indigo-600 shadow-2xl shadow-indigo-500/20 font-black uppercase text-xs tracking-widest transition-all active:scale-95 text-white">
                     <Target className="mr-3 h-5 w-5" /> Start Review Cycle
                  </Button>
                  <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-black uppercase text-xs tracking-widest transition-all text-white">
                     <Download className="mr-3 h-5 w-5" /> Export Reports
                  </Button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
               {[
                 { label: 'Avg Rating', value: analytics?.stats.avgRating || '4.2', icon: Star, color: 'text-amber-400', trend: '+0.2' },
                 { label: 'Completion', value: `${analytics?.stats.completionRate || 85}%`, icon: CheckCircle2, color: 'text-emerald-400', trend: '+12%' },
                 { label: 'Goal Progress', value: `${analytics?.stats.goalCompletionPct || 72}%`, icon: Flag, color: 'text-indigo-400', trend: '+5%' },
                 { label: 'Attrition Risk', value: '12%', icon: AlertCircle, color: 'text-rose-400', trend: '-2%' },
               ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-32 w-full xl:w-48 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 flex flex-col justify-between group hover:bg-white/10 transition-colors cursor-pointer"
                  >
                     <div className="flex items-center justify-between">
                        <stat.icon className={cn("h-6 w-6", stat.color)} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{stat.trend}</span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                        <p className="text-xl font-black tracking-tight">{stat.value}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 2. Intelligence Navigation */}
      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 border border-slate-200">
               <TabsTrigger value="overview" className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">Overview</TabsTrigger>
               <TabsTrigger value="reviews" className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">Review Feed</TabsTrigger>
               <TabsTrigger value="okrs" className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">OKRs & Goals</TabsTrigger>
               <TabsTrigger value="intelligence" className="rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all">AI Insights</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input 
                    placeholder="Search personnel..." 
                    className="h-14 w-full md:w-[280px] pl-12 bg-white border-slate-200 rounded-2xl focus:ring-indigo-600/20 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 bg-white hover:bg-slate-50">
                  <Filter className="h-5 w-5 text-slate-600" />
               </Button>
            </div>
         </div>

         <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-8">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="grid gap-8 lg:grid-cols-12"
               >
                  {/* Performance Trend Area Chart */}
                  <Card className="lg:col-span-8 border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                     <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="text-xl font-black tracking-tight text-slate-900">Performance Velocity</CardTitle>
                           <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Org-wide average rating trend</CardDescription>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                           <TrendingUp className="h-5 w-5" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={analytics?.trends || []}>
                                 <defs>
                                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                                 <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} />
                                 <RechartsTooltip 
                                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                                 />
                                 <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRating)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Bell Curve Distribution */}
                  <Card className="lg:col-span-4 border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                     <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="text-xl font-black tracking-tight text-slate-900">Appraisal Mix</CardTitle>
                           <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Normal distribution (Bell Curve)</CardDescription>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                           <Activity className="h-5 w-5" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="h-[220px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analytics?.distribution || []}>
                                 <XAxis dataKey="name" hide />
                                 <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px', border: 'none', fontSize: '10px' }} />
                                 <Bar dataKey="count" radius={[10, 10, 4, 4]}>
                                    {(analytics?.distribution || []).map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                 </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-3">
                           {(analytics?.distribution || []).map(item => (
                              <div key={item.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                 <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-500">{item.name}</span>
                                 </div>
                                 <span className="text-slate-900">{item.count} Personnel</span>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>
               </motion.div>

               <div className="grid gap-8 lg:grid-cols-3">
                  {/* Department Heatmap */}
                  <Card className="lg:col-span-2 border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                     <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="text-xl font-black tracking-tight text-slate-900">Department Heatmap</CardTitle>
                           <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Performance across business units</CardDescription>
                        </div>
                        <Button variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 p-0 text-slate-400">
                           <MoreHorizontal className="h-5 w-5" />
                        </Button>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {analytics?.heatmap.map(dept => (
                              <div key={dept.name} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col justify-between h-36 group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dept.name}</span>
                                    <div className={cn(
                                       "h-2 w-2 rounded-full",
                                       dept.risk === 'Low' ? 'bg-emerald-500' : dept.risk === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                                    )} />
                                 </div>
                                 <div>
                                    <p className="text-2xl font-black text-slate-900">{dept.rating}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Avg Rating Score</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>

                  {/* Top Performers */}
                  <Card className="lg:col-span-1 border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                     <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                           <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-100">
                              <Trophy className="h-5 w-5" />
                           </div>
                           Top Performers
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                           {analytics?.topPerformers.map((emp, i) => (
                              <div key={emp.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                                       {emp.avatar || emp.name.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-slate-900">{emp.name}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.dept}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                                    <span className="text-xs font-black">{emp.rating}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="p-6 bg-slate-50/50 flex justify-center">
                           <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 gap-2">View All Leaders <ArrowUpRight className="h-3.5 w-3.5" /></Button>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-8">
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
               >
                  <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                     <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Review Intelligence Feed</CardTitle>
                           <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Detailed personnel appraisal records</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                           <Button variant="outline" className="h-12 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest">
                              Cycle: Q1 2026
                           </Button>
                        </div>
                     </CardHeader>
                     <CardContent className="p-0">
                        <div className="overflow-x-auto">
                           <table className="w-full">
                              <thead>
                                 <tr className="bg-slate-50/50">
                                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reviewer</th>
                                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rating</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trend</th>
                                    <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">State</th>
                                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {filteredReviews.map((rev) => (
                                    <tr key={rev.id} className="hover:bg-slate-50/80 transition-all group">
                                       <td className="px-10 py-6">
                                          <div className="flex items-center gap-5">
                                             <div className="h-14 w-14 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform">
                                                {rev.employee.avatar || rev.employee.firstName.charAt(0)}
                                             </div>
                                             <div>
                                                <p className="text-base font-black text-slate-900 leading-tight">{rev.employee.firstName} {rev.employee.lastName}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rev.employee.designation?.name || 'Associate'}</span>
                                                   <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                   <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{rev.employee.department?.name}</span>
                                                </div>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6">
                                          <div className="flex items-center gap-3">
                                             <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <UserCircle className="h-4 w-4 text-slate-400" />
                                             </div>
                                             <p className="text-xs font-bold text-slate-600">{rev.manager?.firstName} {rev.manager?.lastName || 'TBD'}</p>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                                          {rev.reviewCycle.name}
                                       </td>
                                       <td className="px-10 py-6">
                                          <div className="flex flex-col items-center gap-1">
                                             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                                <span className="text-sm font-black text-slate-900">{rev.overallRating || '--'}</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6">
                                          <div className="flex justify-center">
                                             {rev.overallRating && rev.overallRating >= 4 ? (
                                                <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                   <ArrowUpRight className="h-3.5 w-3.5" />
                                                   <span className="text-[9px] font-black uppercase">+14%</span>
                                                </div>
                                             ) : (
                                                <div className="flex items-center gap-1 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                                                   <TrendingDown className="h-3.5 w-3.5" />
                                                   <span className="text-[9px] font-black uppercase">-2%</span>
                                                </div>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-10 py-6">
                                          <div className="flex justify-center">
                                             <span className={cn(
                                                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border-2",
                                                rev.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                rev.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-slate-50 text-slate-500 border-slate-100'
                                             )}>
                                                {rev.status}
                                             </span>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                                <MessageSquare className="h-5 w-5" />
                                             </Button>
                                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-100">
                                                <MoreHorizontal className="h-5 w-5" />
                                             </Button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </CardContent>
                  </Card>
               </motion.div>
            </TabsContent>

            <TabsContent value="okrs" className="space-y-8">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
               >
                  <Card className="p-8 border-none shadow-2xl rounded-[40px] bg-slate-900 text-white col-span-full">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
                        <div className="space-y-4">
                           <h3 className="text-3xl font-black tracking-tight">Strategy Execution Pulse</h3>
                           <p className="text-slate-400 font-medium max-w-xl">
                              Our organizational alignment is currently at <span className="text-white font-black">94%</span>. 
                              68 out of 72 objectives are on track for Q2 completion.
                           </p>
                           <div className="flex items-center gap-8 pt-4">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Active OKRs</p>
                                 <p className="text-2xl font-black">248</p>
                              </div>
                              <div className="h-10 w-px bg-white/10" />
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Key Results</p>
                                 <p className="text-2xl font-black text-indigo-400">1,024</p>
                              </div>
                           </div>
                        </div>
                        <div className="flex-1 max-w-md w-full">
                           <div className="flex justify-between items-end mb-4">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Global Progress</span>
                              <span className="text-4xl font-black">68%</span>
                           </div>
                           <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '68%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                              />
                           </div>
                        </div>
                     </div>
                  </Card>
               </motion.div>
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-8">
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="grid gap-8 lg:grid-cols-2"
               >
                  <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white group border-t-4 border-indigo-500">
                     <CardHeader className="p-10">
                        <div className="h-14 w-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                           <BrainCircuit className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">AI Promotion Readiness</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed mt-2">
                           Autonomous analysis of historical performance, skill acquisition, and peer leadership metrics.
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="p-10 pt-0 space-y-6">
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">JD</div>
                              <div>
                                 <p className="text-sm font-black text-slate-900">James D. (Senior Eng.)</p>
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">98% Readiness Score</p>
                              </div>
                           </div>
                           <Button size="sm" className="rounded-xl bg-white text-slate-900 border-slate-200 shadow-sm hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest">Verify AI Analysis</Button>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between opacity-60">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-slate-400 text-white flex items-center justify-center font-black">SL</div>
                              <div>
                                 <p className="text-sm font-black text-slate-900">Sarah L. (Product)</p>
                                 <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">82% Readiness Score</p>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white group border-t-4 border-rose-500">
                     <CardHeader className="p-10">
                        <div className="h-14 w-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-rose-100 group-hover:rotate-12 transition-transform">
                           <Flame className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Burnout & Attrition Predictor</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed mt-2">
                           Predictive modeling based on work intensity, engagement trends, and historical team attrition patterns.
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="p-10 pt-0">
                        <div className="p-6 rounded-[2rem] bg-rose-50/50 border border-rose-100 flex items-start gap-4">
                           <AlertCircle className="h-6 w-6 text-rose-600 shrink-0 mt-1" />
                           <div className="space-y-2">
                              <p className="text-sm font-black text-rose-900 uppercase tracking-tight">Anomalous Engagement Detected</p>
                              <p className="text-xs font-medium text-rose-800 leading-relaxed">
                                 The Sales Engineering team shows a <span className="font-black">15% decline</span> in communication frequency over 30 days. Risk of silent burnout is elevated.
                              </p>
                              <Button variant="link" className="p-0 h-auto text-rose-900 font-black text-[10px] uppercase tracking-widest">Initiate Wellness Protocol <ChevronRight className="ml-2 h-3 w-3" /></Button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </motion.div>
            </TabsContent>
         </AnimatePresence>
      </Tabs>
    </div>
  );
}
