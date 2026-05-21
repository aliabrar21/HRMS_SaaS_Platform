import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, Filter, Loader2, PlayCircle, 
  TrendingUp, TrendingDown, Users, DollarSign, 
  CreditCard, Landmark, PieChart as PieChartIcon, 
  Calendar, CheckCircle2, AlertCircle, Clock, 
  Search, Bell, ChevronRight, MoreHorizontal, 
  ArrowUpRight, FileText, Ban, RefreshCw, 
  Banknote, Calculator, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  basicPay: number;
  hra: number;
  specialAllowance: number;
  pfDeduction: number;
  ptDeduction: number;
  netSalary: number;
  status: 'DRAFT' | 'PROCESSED' | 'PAID' | 'FAILED';
  employee: { firstName: string; lastName: string; employeeCode: string; department?: string; avatar?: string };
}

const STATS_CARDS = [
  { title: 'Total Payroll Cost', value: '₹42,85,000', trend: '+4.2%', isUp: true, icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Net Salary Paid', value: '₹38,20,000', trend: '+3.1%', isUp: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Total Deductions', value: '₹4,65,000', trend: '+1.5%', isUp: true, icon: Ban, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Tax & Benefits', value: '₹2,10,000', trend: '-0.8%', isUp: false, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const EXPENSE_DATA = [
  { name: 'Jan', amount: 3800000 },
  { name: 'Feb', amount: 3950000 },
  { name: 'Mar', amount: 4100000 },
  { name: 'Apr', amount: 4050000 },
  { name: 'May', amount: 4285000 },
];

const DEPT_DISTRIBUTION = [
  { name: 'Engineering', value: 45, color: '#3b82f6' },
  { name: 'Product', value: 20, color: '#10b981' },
  { name: 'Sales', value: 15, color: '#f59e0b' },
  { name: 'Marketing', value: 12, color: '#8b5cf6' },
  { name: 'Operations', value: 8, color: '#94a3b8' },
];

const SCHEDULE = [
  { event: 'Payroll Processing', date: 'Aug 25, 2025', type: 'System', icon: Clock, color: 'text-blue-500' },
  { event: 'Tax Filing Deadline', date: 'Aug 28, 2025', type: 'Compliance', icon: ShieldCheck, color: 'text-red-500' },
  { event: 'Salary Disbursement', date: 'Aug 31, 2025', type: 'Payment', icon: Banknote, color: 'text-emerald-500' },
];

export function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const response = await axios.get('/api/payroll');
        if (response.data.success) {
          setPayrolls(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch payroll', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => 
      `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employee.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [payrolls, searchQuery]);

  const handleDownload = (record: any) => {
    const data = `Employee: ${record.employee?.firstName} ${record.employee?.lastName}\n` +
                 `Period: ${getMonthName(record.month)} ${record.year}\n` +
                 `Net Salary: ${formatCurrency(record.netPayPaise / 100)}\n` +
                 `Status: ${record.status}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${record.employee?.firstName}_${getMonthName(record.month)}.txt`;
    a.click();
  };

  return (
    <div className="pb-20 space-y-10 animate-in fade-in duration-700">
      {/* 1. Premium Financial Hero */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-600/20 blur-[100px]" />
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
         
         <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10"
               >
                  <Landmark className="h-3.5 w-3.5 text-emerald-400" />
                  Financial Operations Center
               </motion.div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                  Payroll <span className="text-emerald-400">Intelligence</span> Terminal
               </h1>
               
               <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                     <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-emerald-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Cycle</p>
                        <p className="text-lg font-black tracking-tight text-white">August 2025</p>
                     </div>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden md:block" />
                  <div className="flex items-center gap-3">
                     <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-amber-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Payout</p>
                        <p className="text-lg font-black tracking-tight text-white">12 Days Left</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4">
               {STATS_CARDS.map((stat, idx) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="h-32 w-full xl:w-48 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 flex flex-col justify-between group hover:bg-white/10 transition-colors cursor-pointer"
                  >
                     <div className="flex items-center justify-between">
                        <stat.icon className={cn("h-6 w-6", stat.color.replace('text-', 'text-'))} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-white/5", stat.isUp ? 'text-emerald-400' : 'text-rose-400')}>
                           {stat.trend}
                        </span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{stat.title}</p>
                        <p className="text-xl font-black tracking-tight">{stat.value}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <Input 
                    placeholder="Search intelligence records..." 
                    className="h-14 w-full md:w-[320px] pl-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:ring-emerald-400/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white">
                  <Filter className="h-5 w-5" />
               </Button>
            </div>
            
            <div className="flex items-center gap-4">
               <Button className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-2xl shadow-emerald-500/20 font-black uppercase text-xs tracking-widest transition-all active:scale-95 text-white">
                  <PlayCircle className="mr-3 h-5 w-5" /> Execute Payroll
               </Button>
               <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-black uppercase text-xs tracking-widest transition-all text-white">
                  <Download className="mr-3 h-5 w-5" /> Bulk Export
               </Button>
            </div>
         </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Analytics Section */}
        <Card className="lg:col-span-8 border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-50">
            <div>
              <CardTitle className="text-lg font-black">Payroll Analytics</CardTitle>
              <CardDescription className="text-xs font-medium">Monthly cost trend and distribution</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider">
                 6 Months
               </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={EXPENSE_DATA}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `₹${val/100000}L`} />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Total Cost']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Department Share</h4>
                    <div className="h-[140px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={DEPT_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {DEPT_DISTRIBUTION.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="space-y-2">
                    {DEPT_DISTRIBUTION.slice(0, 3).map(dept => (
                      <div key={dept.name} className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                            <span className="text-[10px] font-bold text-slate-600">{dept.name}</span>
                         </div>
                         <span className="text-[10px] font-black text-slate-900">{dept.value}%</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Schedule */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-slate-900 text-white rounded-2xl overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-base font-black">Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="p-4 grid grid-cols-2 gap-3">
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                   <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400"><FileText className="h-5 w-5" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Payslips</span>
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                   <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><Calculator className="h-5 w-5" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Bonus</span>
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                   <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Landmark className="h-5 w-5" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Bank Export</span>
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all">
                   <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><ShieldCheck className="h-5 w-5" /></div>
                   <span className="text-[10px] font-bold uppercase tracking-wider">Taxes</span>
                </Button>
             </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
             <CardHeader className="px-6 py-4 border-b border-slate-50">
                <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center justify-between">
                   Schedule
                   <Calendar className="h-4 w-4 text-slate-400" />
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                   {SCHEDULE.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                         <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50", item.color)}>
                            <item.icon className="h-5 w-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{item.event}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.date}</p>
                         </div>
                         <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
          {/* 3. Operational Control: Payroll Intelligence Feed */}
      <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Intelligence Feed</CardTitle>
                 <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Real-time salary distribution & record auditing</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Synchronization</span>
                 </div>
                 <Button variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                    <Filter className="mr-2 h-4 w-4" /> Filter Feed
                 </Button>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="h-16 w-16 animate-spin rounded-[2rem] border-4 border-emerald-500 border-t-transparent shadow-xl shadow-emerald-100" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Decrypting Financial Data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personnel Intelligence</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gross Allocation</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Strategic Reserve</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Distribution</th>
                    <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">State</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayrolls.map((pr: any) => {
                    const gross = (pr.grossPayPaise || 0) / 100;
                    const deductions = (pr.totalDeductionsPaise || 0) / 100;
                    const net = (pr.netPayPaise || 0) / 100;
                    
                    const fName = pr.employee?.firstName || 'Unknown';
                    const lName = pr.employee?.lastName || 'Employee';
                    const empCode = pr.employee?.employeeCode || 'EMP-XXXX';

                    return (
                      <tr key={pr.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform">
                               {fName.charAt(0)}{lName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 leading-tight">{fName} {lName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{empCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                              <Calendar className="h-3 w-3" />
                              {getMonthName(pr.month)} {pr.year}
                           </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-sm font-black text-slate-900">{formatCurrency(gross)}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-sm font-black text-rose-500">-{formatCurrency(deductions)}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-base font-black text-emerald-600">{formatCurrency(net)}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Authorized</span>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center">
                             <span className={cn(
                               "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border-2 shadow-sm",
                               pr.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                               pr.status === 'PROCESSED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                               'bg-slate-50 text-slate-500 border-slate-100'
                             )}>
                               {pr.status === 'PAID' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />}
                               {pr.status}
                             </span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                   <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-2xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                        onClick={() => handleDownload(pr)}
                                      >
                                         <Download className="h-5 w-5" />
                                      </Button>
                                   </TooltipTrigger>
                                   <TooltipContent className="bg-slate-900 text-white border-none rounded-xl font-black text-[10px] uppercase tracking-widest px-4 py-2">Download Payslip</TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-100">
                                <MoreHorizontal className="h-5 w-5" />
                             </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredPayrolls.length > 0 && (
            <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Volume: {filteredPayrolls.length} Strategic Nodes</p>
               <div className="flex gap-3">
                  <Button variant="outline" className="h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200" disabled>Previous Phase</Button>
                  <Button variant="outline" className="h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200" disabled>Next Phase</Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Strategic Oversight & Compliance */}
      <div className="grid gap-10 md:grid-cols-2">
         <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                     <ShieldCheck className="h-5 w-5" />
                  </div>
                  Compliance Health
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex flex-col justify-between h-40">
                     <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                     <div>
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Tax Integrity</p>
                        <p className="text-2xl font-black text-emerald-900">100%</p>
                     </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex flex-col justify-between h-40">
                     <Calculator className="h-8 w-8 text-blue-500" />
                     <div>
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Deduction Acc.</p>
                        <p className="text-2xl font-black text-blue-900">99.8%</p>
                     </div>
                  </div>
               </div>
               <div className="p-6 rounded-[2rem] bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-amber-400" />
                     </div>
                     <div>
                        <p className="text-sm font-black italic">Documentation Pulse</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">4 Nodes require attention</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 p-0 text-white">
                     <ChevronRight className="h-5 w-5" />
                  </Button>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                     <TrendingUp className="h-5 w-5" />
                  </div>
                  Expense Forecasting
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={EXPENSE_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontBlack: 900, fill: '#94a3b8' }} dy={10} />
                        <RechartsTooltip 
                          cursor={{fill: '#f8fafc', radius: 12}}
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                        />
                        <Bar dataKey="amount" fill="#10b981" radius={[12, 12, 4, 4]} barSize={40} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Q4 Projection</p>
                     <p className="text-xl font-black text-slate-900">₹1.28 Cr</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-2xl">
                     <ArrowUpRight className="h-5 w-5" />
                     <span className="text-xs font-black uppercase tracking-widest">+4.2%</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
