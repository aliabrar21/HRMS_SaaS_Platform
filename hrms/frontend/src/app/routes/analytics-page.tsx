import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, Users, Calendar, 
  AlertTriangle, BrainCircuit, DollarSign, 
  Clock, ShieldAlert, Zap, Filter, 
  Download, ArrowUpRight, ArrowDownRight,
  Info, Sparkles, Activity, Target, Flame
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, Cell as RechartsCell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Mock Data ---
const LEAVE_TRENDS = [
  { month: 'Jan', Annual: 45, Sick: 20, Casual: 15, CompOff: 5 },
  { month: 'Feb', Annual: 30, Sick: 25, Casual: 10, CompOff: 2 },
  { month: 'Mar', Annual: 55, Sick: 18, Casual: 22, CompOff: 8 },
  { month: 'Apr', Annual: 40, Sick: 45, Casual: 18, CompOff: 4 },
  { month: 'May', Annual: 60, Sick: 22, Casual: 25, CompOff: 12 },
  { month: 'Jun', Annual: 50, Sick: 30, Casual: 20, CompOff: 6 },
];

const DEPT_HEATMAP = [
  { dept: 'Engineering', day: 'Mon', count: 12 },
  { dept: 'Engineering', day: 'Tue', count: 4 },
  { dept: 'Engineering', day: 'Wed', count: 2 },
  { dept: 'Engineering', day: 'Thu', count: 5 },
  { dept: 'Engineering', day: 'Fri', count: 15 },
  { dept: 'Sales', day: 'Mon', count: 8 },
  { dept: 'Sales', day: 'Fri', count: 12 },
  // ... more mapping for heatmap visualization
];

const BURNOUT_RISK = [
  { name: 'Sarah J.', risk: 'HIGH', score: 88, signals: ['Overtime (45h)', 'No Leave (4 mo)', '7x Sick Leaves'] },
  { name: 'Mike R.', risk: 'MEDIUM', score: 62, signals: ['Weekend Work', 'Late Logins'] },
  { name: 'Elena K.', risk: 'LOW', score: 24, signals: ['Regular Vacation'] },
];

const ABUSE_SIGNALS = [
  { type: 'Monday-Sick Patterns', count: 12, impact: 'High', trend: '+14%' },
  { type: 'Bridge-Leave Patterns', count: 8, impact: 'Medium', trend: '-5%' },
  { type: 'Short-Notice Clusters', count: 15, impact: 'Critical', trend: '+22%' },
];

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('leave');

  return (
    <div className="pb-10 space-y-8 animate-in fade-in duration-700 bg-slate-50/20">
      {/* Premium Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Workforce Intelligence</h1>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                <Sparkles className="h-3 w-3 text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Intelligence Layer Active</span>
             </div>
             <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
               Data-driven HR Analytics
             </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-11 rounded-2xl px-6 gap-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 border-slate-200">
              <Filter className="h-4 w-4" /> Global Filters
           </Button>
           <Button className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 text-xs font-black uppercase tracking-widest">
             <Download className="mr-2 h-5 w-5" /> Export BI Report
           </Button>
        </div>
      </div>

      <Tabs defaultValue="leave" className="w-full" onValueChange={setActiveTab}>
         <TabsList className="bg-slate-100/50 p-1.5 h-auto rounded-[1.5rem] mb-8 border border-slate-200/50">
            <TabsTrigger value="leave" className="rounded-xl py-3 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">Leave Insights</TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-xl py-3 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">Attendance BI</TabsTrigger>
            <TabsTrigger value="payroll" className="rounded-xl py-3 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">Cost & Finance</TabsTrigger>
            <TabsTrigger value="employee" className="rounded-xl py-3 px-8 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600">Talent Risk</TabsTrigger>
         </TabsList>

         <TabsContent value="leave" className="space-y-8 mt-0">
            {/* Executive KPI Cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
               {[
                 { label: 'Absenteeism Rate', value: '7.2%', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: '↑ 2.1% from LW', positive: false },
                 { label: 'Avg Leave / Emp', value: '14.5d', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Target: < 12d', positive: false },
                 { label: 'Leave Liability', value: '$84.2k', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Accrued Payouts', positive: true },
                 { label: 'Burnout Risk', value: '14%', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-50', sub: '8 High Risk Cases', positive: false },
               ].map((kpi, i) => (
                 <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden group hover:shadow-2xl transition-all">
                       <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                             <div className={cn("p-3 rounded-2xl transition-all group-hover:scale-110 shadow-sm", kpi.bg, kpi.color)}>
                                <kpi.icon className="h-6 w-6" />
                             </div>
                             <div className={cn(
                               "flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                               kpi.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                             )}>
                                {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {kpi.sub}
                             </div>
                          </div>
                          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{kpi.label}</h3>
                          <div className="text-3xl font-black text-slate-900">{kpi.value}</div>
                       </CardContent>
                    </Card>
                 </motion.div>
               ))}
            </div>

            {/* AI Insights Bar */}
            <Card className="border-none shadow-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[2rem] overflow-hidden">
               <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm">
                     <BrainCircuit className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-2">
                        <Zap className="h-5 w-5 text-amber-300 fill-amber-300" />
                        <h2 className="text-xl font-black uppercase tracking-widest italic">AI Intelligence Summary</h2>
                     </div>
                     <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-white/50 uppercase">Operational Risk</p>
                           <p className="text-xs font-bold leading-relaxed">Engineering sick leave increased 23% this month. Potential burnout cluster detected.</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-white/50 uppercase">Attrition Correlation</p>
                           <p className="text-xs font-bold leading-relaxed">Employees with high overtime are 2.4x more likely to take sick leave in 48h.</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-white/50 uppercase">Staffing Forecast</p>
                           <p className="text-xs font-bold leading-relaxed">December may face staffing shortages. Predicted Engineering availability: 61%.</p>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-12">
               {/* Main Trend Chart */}
               <Card className="lg:col-span-8 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="px-10 py-8 border-b border-slate-50 flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="text-2xl font-black">Monthly Leave Distribution</CardTitle>
                        <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">BI Pattern detection across leave categories</CardDescription>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-indigo-500" />
                           <span className="text-[9px] font-black uppercase text-slate-400">Annual</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-rose-500" />
                           <span className="text-[9px] font-black uppercase text-slate-400">Sick</span>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="p-10">
                     <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={LEAVE_TRENDS}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontBlack: 900, fill: '#94a3b8' }} dy={15} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontBlack: 900, fill: '#94a3b8' }} />
                              <RechartsTooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -10px rgb(0 0 0 / 0.1)', padding: '20px' }}
                              />
                              <Bar dataKey="Annual" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} barSize={40} />
                              <Bar dataKey="Sick" stackId="a" fill="#f43f5e" />
                              <Bar dataKey="Casual" stackId="a" fill="#f59e0b" />
                              <Bar dataKey="CompOff" stackId="a" fill="#10b981" radius={[10, 10, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </CardContent>
               </Card>

               {/* Right Side: Burnout & Abuse */}
               <div className="lg:col-span-4 space-y-8">
                  {/* Burnout Detection */}
                  <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
                     <CardHeader className="px-8 py-6 border-b border-slate-50">
                        <CardTitle className="text-base font-black flex items-center justify-between">
                           Burnout Risk Engine
                           <Flame className="h-5 w-5 text-rose-500" />
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                           {BURNOUT_RISK.map((risk, i) => (
                              <div key={i} className="p-6 hover:bg-slate-50 transition-all group">
                                 <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                       <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                          {risk.name.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black">{risk.name}</p>
                                          <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            risk.risk === 'HIGH' ? 'text-rose-500' : 'text-amber-500'
                                          )}>{risk.risk} RISK</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-lg font-black text-slate-900">{risk.score}</p>
                                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Stress Score</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {risk.signals.map(s => (
                                       <span key={s} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200">
                                          {s}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                     <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                           View Full Risk Analysis
                        </Button>
                     </div>
                  </Card>

                  {/* Abuse Anomaly Detection */}
                  <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] overflow-hidden">
                     <CardHeader className="px-8 py-6 border-b border-white/5">
                        <CardTitle className="text-base font-black flex items-center justify-between">
                           Anomaly Detection
                           <ShieldAlert className="h-5 w-5 text-indigo-400" />
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-6 space-y-6">
                        {ABUSE_SIGNALS.map((signal, i) => (
                           <div key={i} className="flex items-center gap-4">
                              <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                                signal.impact === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                              )}>
                                 <Activity className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{signal.type}</p>
                                    <span className="text-[10px] font-black text-rose-400">{signal.trend}</span>
                                 </div>
                                 <p className="text-sm font-black mt-1">{signal.count} Cases Found</p>
                              </div>
                           </div>
                        ))}
                     </CardContent>
                  </Card>
               </div>
            </div>

            {/* Department Heatmap & Cost Analysis */}
            <div className="grid gap-8 lg:grid-cols-12">
               <Card className="lg:col-span-7 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="px-10 py-8 border-b border-slate-50">
                     <CardTitle className="text-xl font-black">Dept. Attendance Heatmap</CardTitle>
                     <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Density of absenteeism by weekday & department</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10">
                     <div className="h-[280px] flex items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="text-center space-y-4">
                           <div className="h-16 w-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-slate-300">
                              <Target className="h-8 w-8" />
                           </div>
                           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interactive Density Matrix Rendering...</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="lg:col-span-5 border-none shadow-xl bg-indigo-600 text-white rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="px-10 py-8 border-b border-white/5">
                     <CardTitle className="text-xl font-black">Financial Liability BI</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Total Leave Liability</p>
                        <div className="text-5xl font-black">$248,400.00</div>
                        <p className="text-[11px] font-bold text-white/70 italic">Calculated for 1,240 employees</p>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase text-white/40">Paid Liability</p>
                           <p className="text-lg font-black">$184k</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase text-white/40">Unpaid Liability</p>
                           <p className="text-lg font-black">$64k</p>
                        </div>
                     </div>
                     <div className="p-6 rounded-[2rem] bg-white/10 backdrop-blur-md space-y-4">
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-black uppercase tracking-widest">Leave Payout Forecast</p>
                           <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                           <div className="h-1.5 w-full bg-white/10 rounded-full">
                              <div className="h-full w-2/3 bg-emerald-400 rounded-full" />
                           </div>
                           <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest text-center">67% Budget Utilized for Q3</p>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
