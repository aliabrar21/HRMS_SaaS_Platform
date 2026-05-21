import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer } from '@/components/ui/drawer';
import { 
  CreditCard, Wallet, Landmark, Receipt, 
  Search, Filter, Plus, Loader2, 
  ChevronRight, MoreVertical, ShieldCheck,
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  Users, History, ArrowUpRight, ArrowDownRight,
  PieChart as PieChartIcon, FileText, Download,
  ExternalLink, Banknote, DollarSign,
  Coffee, Plane, Monitor, Briefcase,
  Zap, Activity, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { format } from 'date-fns';

// --- Types ---
interface ExpenseClaim {
  id: string;
  claimId: string;
  employee: {
    name: string;
    department: string;
    avatar?: string;
  };
  category: 'TRAVEL' | 'MEAL' | 'TECH' | 'OFFICE' | 'OTHER';
  amount: number;
  currency: string;
  status: 'PENDING' | 'VERIFIED' | 'REIMBURSED' | 'REJECTED';
  date: string;
  merchant: string;
  hasReceipt: boolean;
}

// --- Mock Data ---
const EXPENSE_SUMMARY = [
  { title: 'Total Disbursed', value: '₹14.2L', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+18% vs Last Quarter' },
  { title: 'Pending Approval', value: '₹84,500', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '12 claims awaiting' },
  { title: 'Operational Spend', value: '₹2.4L', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Within Budget' },
  { title: 'Reimbursement TAT', value: '1.4 Days', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Optimal Speed' },
  { title: 'Policy Compliance', value: '99.2%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Audit Ready' },
  { title: 'Saved via Tax', value: '₹45K', icon: Sparkles, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Tax Efficiency Optimized' },
];

const CLAIMS: ExpenseClaim[] = [
  {
    id: '1', claimId: 'CLM-2025-001', employee: { name: 'Sarah Connor', department: 'Engineering' },
    category: 'TRAVEL', amount: 12500, currency: 'INR', status: 'VERIFIED',
    date: '2025-05-10', merchant: 'IndiGo Airlines', hasReceipt: true
  },
  {
    id: '2', claimId: 'CLM-2025-002', employee: { name: 'James Holden', department: 'Operations' },
    category: 'MEAL', amount: 4500, currency: 'INR', status: 'PENDING',
    date: '2025-05-12', merchant: 'The Grand Hotel', hasReceipt: true
  },
  {
    id: '3', claimId: 'CLM-2025-003', employee: { name: 'Naomi Nagata', department: 'Engineering' },
    category: 'TECH', amount: 8900, currency: 'INR', status: 'REIMBURSED',
    date: '2025-05-08', merchant: 'Amazon Cloud', hasReceipt: true
  },
  {
    id: '4', claimId: 'CLM-2025-004', employee: { name: 'Amos Burton', department: 'Security' },
    category: 'OFFICE', amount: 2400, currency: 'INR', status: 'REJECTED',
    date: '2025-05-01', merchant: 'Staples Inc', hasReceipt: false
  },
];

const SPEND_TRENDS = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 },
  { month: 'May', amount: 58000 },
];

export function ExpensesPage() {
  const [isClaimDrawerOpen, setIsClaimDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusStyle = (status: ExpenseClaim['status']) => {
    switch (status) {
      case 'REIMBURSED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'VERIFIED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getCategoryIcon = (cat: ExpenseClaim['category']) => {
    switch (cat) {
      case 'TRAVEL': return Plane;
      case 'MEAL': return Coffee;
      case 'TECH': return Monitor;
      case 'OFFICE': return Briefcase;
      default: return Receipt;
    }
  };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Financial Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Capital Deployment Hub</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Spend Governance • Real-time Reimbursement • Tax Optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <Download className="h-4 w-4" /> Export Ledger
          </Button>
          <Button 
            onClick={() => setIsClaimDrawerOpen(true)}
            className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none"
          >
            <Plus className="mr-2 h-4 w-4" /> Claim Expense
          </Button>
        </div>
      </div>

      {/* 2. Spend KPIs */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {EXPENSE_SUMMARY.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                   <TrendingUp className="h-3 w-3" /> {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 3. Operational Ledger */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Claims Table/List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
             <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Expense Ledger</h2>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Feed</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="relative group min-w-[240px]">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                   <Input 
                     placeholder="Search merchant, claim ID..." 
                     className="h-11 pl-11 pr-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <Button variant="outline" className="h-11 rounded-2xl px-5 gap-2 border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"><Filter className="h-4 w-4" /> Filter</Button>
             </div>
          </div>

          <div className="grid gap-6">
             {CLAIMS.map((claim, idx) => {
                const Icon = getCategoryIcon(claim.category);
                return (
                  <motion.div
                    key={claim.id}
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
                               <p className="text-lg font-black text-slate-900 leading-none">{claim.merchant}</p>
                               <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", getStatusStyle(claim.status))}>
                                  {claim.status}
                               </span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><Receipt className="h-3.5 w-3.5" /> {claim.claimId}</span>
                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                               <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Submitted {format(new Date(claim.date), 'dd MMM')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-10">
                           <div className="space-y-1 text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Claim Amount</p>
                              <p className="text-2xl font-black text-slate-900">₹{claim.amount.toLocaleString()}</p>
                           </div>

                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Claimant</p>
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                    {claim.employee.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{claim.employee.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{claim.employee.department}</p>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              {claim.hasReceipt && (
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600"><FileText className="h-5 w-5" /></Button>
                              )}
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

        {/* Side Spend Analytics */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Spend Velocity
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={SPEND_TRENDS}>
                          <defs>
                             <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} />
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)' }}
                             itemStyle={{ fontSize: '10px', fontBlack: '900', textTransform: 'uppercase' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#colorAmount)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-8 p-4 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Monthly Claim</p>
                       <p className="text-lg font-black text-slate-900">₹52,400</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                       <ArrowUpRight className="h-5 w-5" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[40px] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-6">
                 <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <DollarSign className="h-7 w-7 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black">Tax Compliance</h3>
                    <p className="text-xs font-medium text-white/80 leading-relaxed">
                       All 18A and GST inputs are mapped to the core payroll module. Current tax savings projected at ₹2.4L.
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full justify-between rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase px-6 text-white">
                    View Tax Ledger
                    <ChevronRight className="h-4 w-4" />
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Approval Queue</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { user: 'James Holden', amount: '₹4,500', category: 'Meal', time: '5m ago' },
                   { user: 'Naomi Nagata', amount: '₹12,000', category: 'Travel', time: '2h ago' },
                   { user: 'Amos Burton', amount: '₹2,400', category: 'Office', time: '1d ago' },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600">
                            <Clock className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.user}: {log.amount}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{log.category}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-indigo-600 uppercase">{log.time}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* 4. Drawers */}
      <Drawer
        isOpen={isClaimDrawerOpen}
        onClose={() => setIsClaimDrawerOpen(false)}
        title="Expense Submission"
        description="Deploy a new capital reimbursement request."
      >
        <div className="px-6 pb-32 space-y-8">
           <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3 group hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                 <Plane className="h-8 w-8 text-indigo-600" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Travel</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3 group hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                 <Coffee className="h-8 w-8 text-indigo-600" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Meals</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Reimbursement workflow will render here...</p>
              <div className="h-40 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                 <Upload className="h-8 w-8 mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Drop Receipt PDF/JPG</p>
              </div>
           </div>

           <Button className="h-14 w-full rounded-2xl bg-indigo-600 font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-100">Submit Claim</Button>
        </div>
      </Drawer>
    </div>
  );
}

// Re-importing Upload for the drawer
import { Upload } from 'lucide-react';
