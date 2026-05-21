import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Activity, Server, Database, ShieldCheck, 
  Terminal, Search,
  TrendingUp,
  Cpu, Zap,
  RefreshCw, Share2,
  Lock, Globe, Cloud, Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';

// --- Mock Data ---
const SYSTEM_SUMMARY = [
  { title: 'Infrastructure Uptime', value: '99.99%', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Live across 3 regions' },
  { title: 'API Response Time', value: '42ms', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'p95 latency optimized' },
  { title: 'Database Health', value: 'Healthy', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50', trend: '12 active connections' },
  { title: 'Active Sessions', value: '1,420', icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Peak hour load' },
  { title: 'CPU Usage', value: '24%', icon: Cpu, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Optimized utilization' },
  { title: 'Security Patch', value: 'v2.4.1', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'LTS Protection' },
];

const PERFORMANCE_DATA = [
  { time: '00:00', latency: 38, load: 12 },
  { time: '04:00', latency: 32, load: 8 },
  { time: '08:00', latency: 45, load: 45 },
  { time: '12:00', latency: 52, load: 88 },
  { time: '16:00', latency: 48, load: 65 },
  { time: '20:00', latency: 40, load: 30 },
];

const LOGS = [
  { type: 'INFO', module: 'AUTH', message: 'User login successful', id: 'u_882', time: '2m ago', color: 'text-emerald-400' },
  { type: 'INFO', module: 'PAYROLL', message: 'Batch PR_05_26 initiated', id: 'b_12', time: '5m ago', color: 'text-emerald-400' },
  { type: 'WARN', module: 'STORAGE', message: 'High memory usage (85%) on worker-2', id: 'w_02', time: '12m ago', color: 'text-amber-400' },
  { type: 'INFO', module: 'DATABASE', message: 'Replication sync completed', id: 'db_sync', time: '15m ago', color: 'text-indigo-400' },
  { type: 'ERROR', module: 'API', message: 'Timeout on /v1/analytics endpoint', id: 'e_504', time: '20m ago', color: 'text-rose-400' },
];

export function MonitoringPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Infrastructure Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Infrastructure Pulse</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Real-time Health • Audit Ready • Disaster Recovery Enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} /> Force Resync
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none">
            <Share2 className="mr-2 h-4 w-4" /> Incident Report
          </Button>
        </div>
      </div>

      {/* 2. Health KPIs */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {SYSTEM_SUMMARY.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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

      {/* 3. Operational Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Performance Visualization */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900">
                       <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5" />
                       </div>
                       Performance Velocity
                    </CardTitle>
                    <div className="flex items-center gap-2">
                       <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Live Stream
                       </span>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={PERFORMANCE_DATA}>
                          <defs>
                             <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                             itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                          />
                          <Area type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={4} fill="url(#colorLatency)" />
                          <Area type="monotone" dataKey="load" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[40px] overflow-hidden">
                 <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white/50 flex items-center justify-between">
                       Compute Clusters
                       <Server className="h-4 w-4 text-indigo-400" />
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    {[
                      { name: 'Primary-DB-Node', health: 100, color: 'bg-emerald-500' },
                      { name: 'API-Gateway-01', health: 98, color: 'bg-indigo-500' },
                      { name: 'Worker-Group-A', health: 85, color: 'bg-amber-500' },
                    ].map(node => (
                      <div key={node.name} className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{node.name}</span>
                            <span className="text-[10px] font-black text-white">{node.health}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${node.health}%` }}
                              transition={{ duration: 1 }}
                              className={cn("h-full rounded-full", node.color)} 
                            />
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
                 <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                       Storage Security
                       <Lock className="h-4 w-4 text-emerald-500" />
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                          <Cloud className="h-8 w-8" />
                       </div>
                       <div>
                          <p className="text-lg font-black text-slate-900">S3 Secured</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encryption</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-slate-500">Auto-Backup</span>
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-lg uppercase tracking-widest">Active</span>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

        {/* Real-time Console */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-slate-950 text-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5 bg-slate-900/50">
                 <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <Terminal className="h-5 w-5 text-indigo-400" />
                    System Console
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="p-6 h-[400px] overflow-y-auto font-mono text-[10px] space-y-6 no-scrollbar">
                    {LOGS.map((log, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-1.5"
                      >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <span className={cn("font-black tracking-tighter", log.color)}>[{log.type}]</span>
                               <span className="text-white/30">{log.module}</span>
                            </div>
                            <span className="text-white/20 text-[8px]">{log.time}</span>
                         </div>
                         <p className="text-white/70 pl-2 border-l border-white/5">{log.message}</p>
                         <p className="text-indigo-400/50 pl-2 text-[8px]">ID: {log.id}</p>
                      </motion.div>
                    ))}
                 </div>
                 <div className="p-6 border-t border-white/5 bg-slate-900/30">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                       <Input className="h-10 pl-10 rounded-xl bg-white/5 border-white/10 text-xs placeholder:text-white/20 text-white focus:border-indigo-500 transition-all" placeholder="Grep console logs..." />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Security Watch</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                 {[
                   { label: 'SSL Certificate', status: 'Active', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Cloudflare WAF', status: 'Proxied', icon: Globe, color: 'text-indigo-500' },
                   { label: 'Auth Middleware', status: 'Secure', icon: Fingerprint, color: 'text-violet-500' },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className={cn("h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center", item.color)}>
                            <item.icon className="h-5 w-5" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest">{item.status}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
