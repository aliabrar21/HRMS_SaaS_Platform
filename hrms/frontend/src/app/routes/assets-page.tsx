import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer } from '@/components/ui/drawer';
import { 
  Laptop, Monitor, Smartphone, Tablet, 
  Search, Filter, Plus, Loader2, 
  ChevronRight, MoreVertical, ShieldCheck,
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  Users, History, Settings, ExternalLink,
  QrCode, HardDrive, Cpu, Wifi, Battery,
  MousePointer2, Zap, ArrowUpRight,
  ShieldAlert, Activity, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// --- Types ---
interface Asset {
  id: string;
  tag: string;
  name: string;
  type: 'LAPTOP' | 'MONITOR' | 'MOBILE' | 'PERIPHERAL' | 'OTHER';
  status: 'ALLOCATED' | 'AVAILABLE' | 'REPAIR' | 'DECOMMISSIONED';
  health: 'GOOD' | 'FAIR' | 'POOR';
  assignedTo?: {
    name: string;
    department: string;
    avatar?: string;
  };
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
  };
  purchaseDate: string;
  warrantyExpiry: string;
  value: number;
}

// --- Mock Data ---
const ASSET_SUMMARY = [
  { title: 'Total Inventory', value: '1,240', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+45 this month' },
  { title: 'Provisioned', value: '890', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '72% Utilization' },
  { title: 'Maintenance', value: '12', icon: Settings, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Average 3d TAT' },
  { title: 'Compliance', value: '100%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Fully Audited' },
  { title: 'Asset Value', value: '₹4.2Cr', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Depreciation Logged' },
  { title: 'Available', value: '338', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Ready to Deploy' },
];

const ASSETS: Asset[] = [
  {
    id: '1', tag: 'AST-2025-001', name: 'MacBook Pro M3 Max', type: 'LAPTOP', status: 'ALLOCATED', health: 'GOOD',
    assignedTo: { name: 'Sarah Connor', department: 'Engineering' },
    specs: { cpu: 'M3 Max', ram: '64GB', storage: '1TB' },
    purchaseDate: '2025-01-10', warrantyExpiry: '2028-01-10', value: 350000
  },
  {
    id: '2', tag: 'AST-2025-042', name: 'Studio Display 5K', type: 'MONITOR', status: 'ALLOCATED', health: 'GOOD',
    assignedTo: { name: 'Sarah Connor', department: 'Engineering' },
    specs: { cpu: 'A13 Bionic', ram: '-', storage: '-' },
    purchaseDate: '2025-01-12', warrantyExpiry: '2028-01-12', value: 160000
  },
  {
    id: '3', tag: 'AST-2024-112', name: 'ThinkPad X1 Carbon', type: 'LAPTOP', status: 'REPAIR', health: 'FAOR' as any,
    assignedTo: { name: 'James Holden', department: 'Operations' },
    specs: { cpu: 'i7 13th Gen', ram: '32GB', storage: '512GB' },
    purchaseDate: '2024-06-05', warrantyExpiry: '2026-06-05', value: 180000
  },
  {
    id: '4', tag: 'AST-2025-089', name: 'iPhone 15 Pro', type: 'MOBILE', status: 'AVAILABLE', health: 'GOOD',
    specs: { cpu: 'A17 Pro', ram: '8GB', storage: '256GB' },
    purchaseDate: '2025-02-20', warrantyExpiry: '2026-02-20', value: 120000
  },
];

const HEALTH_DISTRIBUTION = [
  { name: 'Healthy', value: 85, color: '#10b981' },
  { name: 'Degraded', value: 12, color: '#f59e0b' },
  { name: 'Critical', value: 3, color: '#ef4444' },
];

export function AssetsPage() {
  const [isProvisionDrawerOpen, setIsProvisionDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusStyle = (status: Asset['status']) => {
    switch (status) {
      case 'ALLOCATED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'AVAILABLE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'REPAIR': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'DECOMMISSIONED': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'LAPTOP': return Laptop;
      case 'MONITOR': return Monitor;
      case 'MOBILE': return Smartphone;
      case 'PERIPHERAL': return MousePointer2;
      default: return Package;
    }
  };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Strategic Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Asset Intelligence Hub</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Provisioning • Lifecycle • Audit Protection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <History className="h-4 w-4" /> Audit Logs
          </Button>
          <Button 
            onClick={() => setIsProvisionDrawerOpen(true)}
            className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none"
          >
            <Plus className="mr-2 h-4 w-4" /> Provision Asset
          </Button>
        </div>
      </div>

      {/* 2. KPI Pulse Row */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {ASSET_SUMMARY.map((stat, idx) => (
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

      {/* 3. Main Operational Interface */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Inventory Ledger */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Provisioned Inventory</h2>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="relative group min-w-[240px]">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                   <Input 
                     placeholder="Search serial, tag, or user..." 
                     className="h-11 pl-11 pr-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <Button variant="outline" className="h-11 rounded-2xl px-5 gap-2 border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"><Filter className="h-4 w-4" /> Filter</Button>
             </div>
          </div>

          <div className="grid gap-6">
             {ASSETS.map((asset, idx) => {
                const Icon = getAssetIcon(asset.type);
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden group hover:shadow-indigo-100/50 transition-all border border-slate-50">
                      <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                             <Icon className="h-8 w-8" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                               <p className="text-lg font-black text-slate-900 leading-none">{asset.name}</p>
                               <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", getStatusStyle(asset.status))}>
                                  {asset.status}
                               </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5" /> {asset.tag}</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Warranty {format(new Date(asset.warrantyExpiry), 'MMM yyyy')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-10">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical specs</p>
                              <div className="flex gap-2">
                                 <div className="px-2 py-1 rounded-lg bg-slate-50 text-[9px] font-black text-slate-600 border border-slate-100 flex items-center gap-1"><Cpu className="h-3 w-3" /> {asset.specs.cpu}</div>
                                 <div className="px-2 py-1 rounded-lg bg-slate-50 text-[9px] font-black text-slate-600 border border-slate-100 flex items-center gap-1"><HardDrive className="h-3 w-3" /> {asset.specs.ram}</div>
                              </div>
                           </div>

                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned To</p>
                              {asset.assignedTo ? (
                                <div className="flex items-center gap-3">
                                   <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                      {asset.assignedTo.name.charAt(0)}
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-900">{asset.assignedTo.name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{asset.assignedTo.department}</p>
                                   </div>
                                </div>
                              ) : (
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Unassigned</span>
                              )}
                           </div>

                           <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600"><Eye className="h-5 w-5" /></Button>
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-slate-100"><MoreVertical className="h-5 w-5" /></Button>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
             })}
          </div>
        </div>

        {/* Side Intelligence */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Health Overview
                    <Activity className="h-5 w-5 text-indigo-600" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={HEALTH_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={10}
                            dataKey="value"
                          >
                             {HEALTH_DISTRIBUTION.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)' }}
                             itemStyle={{ fontSize: '10px', fontBlack: '900', textTransform: 'uppercase' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-3 gap-4 mt-8">
                    {HEALTH_DISTRIBUTION.map(item => (
                       <div key={item.name} className="text-center space-y-1">
                          <div className="h-1.5 rounded-full mx-auto w-8" style={{ backgroundColor: item.color }} />
                          <p className="text-[10px] font-black text-slate-900 mt-2">{item.value}%</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[40px] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-6">
                 <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ShieldAlert className="h-7 w-7 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black">Audit Readiness</h3>
                    <p className="text-xs font-medium text-white/80 leading-relaxed">
                       Last infrastructure audit completed on May 1st. Next scheduled review in 45 days.
                    </p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/10 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Compliance Active</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/60" />
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Feed</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { action: 'Provisioned', asset: 'MacBook Pro', user: 'Sarah Connor', time: '2h ago', color: 'text-emerald-500' },
                   { action: 'Maintenance', asset: 'ThinkPad X1', user: 'James Holden', time: '5h ago', color: 'text-amber-500' },
                   { action: 'Decommission', asset: 'iPhone 12', user: 'Archive', time: '1d ago', color: 'text-slate-400' },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                         <div className={cn("h-2 w-2 rounded-full bg-current", log.color)} />
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.action}: {log.asset}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{log.user}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase">{log.time}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* 4. Drawers */}
      <Drawer
        isOpen={isProvisionDrawerOpen}
        onClose={() => setIsProvisionDrawerOpen(false)}
        title="Asset Provisioning"
        description="Initiate the lifecycle of a new corporate asset."
      >
        <div className="px-6 pb-32 space-y-8">
           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3 group hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                 <Laptop className="h-8 w-8 text-indigo-600" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Compute</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3 group hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                 <Monitor className="h-8 w-8 text-indigo-600" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Display</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Serial Identifier</Label>
              <Input className="h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-600" placeholder="e.g. C02XG..." />
           </div>

           <Button className="h-14 w-full rounded-2xl bg-indigo-600 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-100">Deploy to Inventory</Button>
        </div>
      </Drawer>
    </div>
  );
}
