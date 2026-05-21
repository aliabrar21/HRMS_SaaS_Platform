import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Search, Filter, Loader2, FileText, 
  Download, Eye, MoreVertical, ShieldCheck, 
  Clock, AlertCircle, CheckCircle2, XCircle,
  FolderOpen, User, Calendar, Lock,
  TrendingUp, ArrowUpRight, History,
  ShieldAlert, Fingerprint, Cloud,
  FileSignature, ChevronRight, CheckSquare,
  Square, Archive, Trash2, Mail, ExternalLink,
  Info, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
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

// --- Types ---
interface Document {
  id: string;
  employeeId: string;
  name: string;
  category: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'ARCHIVED';
  fileSize: string;
  expiryDate?: string;
  uploadedDate: string;
  employee: { firstName: string; lastName: string; department: string; avatar?: string; completion: number };
  verifiedBy?: string;
  version: number;
}

// --- Mock Data ---
const DOC_SUMMARY = [
  { title: 'Total Documents', value: '2,430', icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12% vs LW' },
  { title: 'Pending Verification', value: '14', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'HR Action Needed' },
  { title: 'Expiring Soon', value: '5', icon: Clock, color: 'text-red-600', bg: 'bg-red-50', trend: 'Next 15 days' },
  { title: 'Rejected Docs', value: '3', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Awaiting correction' },
  { title: 'Policy Compliance', value: '98%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Target met' },
  { title: 'Storage Used', value: '1.2 GB', icon: Cloud, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'S3 Secured' },
];

const RECENT_DOCS: Document[] = [
  { 
    id: '1', employeeId: '101', name: 'Passport_Scan_2025.pdf', category: 'Identity', status: 'VERIFIED', 
    fileSize: '2.4 MB', uploadedDate: '2025-05-10', employee: { firstName: 'Sarah', lastName: 'Connor', department: 'Engineering', completion: 92 },
    version: 2
  },
  { 
    id: '2', employeeId: '102', name: 'Signed_NDA_Holden.pdf', category: 'Contract', status: 'PENDING', 
    fileSize: '1.1 MB', uploadedDate: '2025-05-12', employee: { firstName: 'James', lastName: 'Holden', department: 'Operations', completion: 45 },
    version: 1
  },
  { 
    id: '3', employeeId: '103', name: 'Tax_ID_Card.png', category: 'Tax', status: 'REJECTED', 
    fileSize: '800 KB', uploadedDate: '2025-05-08', employee: { firstName: 'Naomi', lastName: 'Nagata', department: 'Engineering', completion: 80 },
    version: 3
  },
  { 
    id: '4', employeeId: '104', name: 'Work_Visa_Exp.pdf', category: 'Immigration', status: 'EXPIRED', 
    fileSize: '3.2 MB', expiryDate: '2025-05-01', uploadedDate: '2025-04-10', employee: { firstName: 'Amos', lastName: 'Burton', department: 'Security', completion: 60 },
    version: 1
  },
];

const ANALYTICS_DATA = [
  { name: 'Identity', count: 450, color: '#3b82f6' },
  { name: 'Contracts', count: 320, color: '#10b981' },
  { name: 'Tax', count: 280, color: '#f59e0b' },
  { name: 'Policy', count: 180, color: '#6366f1' },
];

export function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedDocs.length === RECENT_DOCS.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(RECENT_DOCS.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(d => d !== id));
    } else {
      setSelectedDocs([...selectedDocs, id]);
    }
  };

  const getStatusStyle = (status: Document['status']) => {
    switch (status) {
      case 'VERIFIED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      case 'EXPIRED': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="pb-10 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Document lifecycle Platform</h1>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Compliance-driven secure employee record management.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-widest gap-2">
             <FileSignature className="h-4 w-4" /> Sign Requests
          </Button>
          <Button className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
            <Upload className="mr-2 h-4 w-4" /> Secure Upload
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {DOC_SUMMARY.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className={cn("p-2 w-fit rounded-lg mb-3 transition-colors", stat.bg, stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{stat.title}</h3>
                <div className="text-xl font-black text-slate-900">{stat.value}</div>
                <div className="mt-auto pt-2 flex items-center gap-1 text-[9px] font-bold text-slate-400">
                   <TrendingUp className="h-3 w-3" /> {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6">
          <TabsList className="bg-slate-100/50 p-1 h-auto rounded-2xl grid grid-cols-2 lg:grid-cols-4 w-full lg:w-auto">
             <TabsTrigger value="all" className="rounded-xl py-2 px-6 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">All Records</TabsTrigger>
             <TabsTrigger value="pending" className="rounded-xl py-2 px-6 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending HR</TabsTrigger>
             <TabsTrigger value="expiring" className="rounded-xl py-2 px-6 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">Expiring Soon</TabsTrigger>
             <TabsTrigger value="templates" className="rounded-xl py-2 px-6 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">Templates</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input placeholder="Search employee or file..." className="h-10 pl-10 rounded-xl bg-white border-slate-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
             </div>
             <Button variant="outline" className="h-10 rounded-xl px-4 gap-2 font-black text-xs uppercase tracking-widest"><Filter className="h-4 w-4" /> Filters</Button>
          </div>
        </div>

        <TabsContent value="all" className="mt-0 space-y-6">
          {/* Bulk Actions Header */}
          <AnimatePresence>
            {selectedDocs.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="flex items-center justify-between p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white"
               >
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-black uppercase tracking-wider">{selectedDocs.length} Records Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Selected
                     </Button>
                     <Button variant="ghost" className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest">
                        <Archive className="mr-2 h-4 w-4" /> Archive Selected
                     </Button>
                     <Button variant="ghost" className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest">
                        <Download className="mr-2 h-4 w-4" /> Export Batch
                     </Button>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Documents Table */}
            <Card className="lg:col-span-9 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="bg-slate-50/50 border-b border-slate-100">
                              <th className="px-6 py-4 text-left">
                                 <button onClick={toggleSelectAll} className="h-5 w-5 rounded-md border-2 border-slate-200 flex items-center justify-center transition-colors hover:border-indigo-600">
                                    {selectedDocs.length === RECENT_DOCS.length ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-transparent" />}
                                 </button>
                              </th>
                              <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Document</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Owner & Compliance</th>
                              <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                              <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Expiry</th>
                              <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {RECENT_DOCS.map((doc) => (
                              <tr key={doc.id} className={cn(
                                "group transition-colors",
                                selectedDocs.includes(doc.id) ? "bg-indigo-50/30" : "hover:bg-slate-50/50"
                              )}>
                                 <td className="px-6 py-5">
                                    <button onClick={() => toggleSelect(doc.id)} className="h-5 w-5 rounded-md border-2 border-slate-200 flex items-center justify-center transition-colors group-hover:border-indigo-600">
                                       {selectedDocs.includes(doc.id) ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-transparent" />}
                                    </button>
                                 </td>
                                 <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                       <div className="h-10 w-10 rounded-xl bg-slate-100 border flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                          <FileText className="h-5 w-5" />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-sm font-black text-slate-900 truncate">{doc.name}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{doc.category}</span>
                                             <span className="h-1 w-1 rounded-full bg-slate-200" />
                                             <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tight">v{doc.version}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1.5">
                                       <div className="flex items-center gap-2">
                                          <span className="text-xs font-black text-slate-700">{doc.employee.firstName} {doc.employee.lastName}</span>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.employee.department}</span>
                                       </div>
                                       <div className="w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${doc.employee.completion}%` }} />
                                       </div>
                                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile {doc.employee.completion}% Complete</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5">
                                    <div className="flex justify-center">
                                       <span className={cn(
                                          "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
                                          getStatusStyle(doc.status)
                                       )}>
                                          {doc.status === 'VERIFIED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                          {doc.status}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    {doc.expiryDate ? (
                                       <div className="flex flex-col items-end">
                                          <span className={cn(
                                             "text-xs font-black",
                                             differenceInDays(new Date(doc.expiryDate), new Date()) < 30 ? "text-red-500" : "text-slate-700"
                                          )}>
                                             {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                             {differenceInDays(new Date(doc.expiryDate), new Date())} Days Left
                                          </span>
                                       </div>
                                    ) : (
                                       <span className="text-xs font-bold text-slate-300">Lifetime</span>
                                    )}
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100">
                                             <MoreVertical className="h-4.5 w-4.5 text-slate-400" />
                                          </Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-slate-100 shadow-2xl">
                                          <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-3 py-2">Doc Actions</DropdownMenuLabel>
                                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-3 focus:bg-indigo-50 focus:text-indigo-600">
                                             <Eye className="h-4 w-4" /> Preview
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-3 focus:bg-indigo-50 focus:text-indigo-600">
                                             <Download className="h-4 w-4" /> Download
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-3 text-emerald-600 focus:bg-emerald-50">
                                             <ShieldCheck className="h-4 w-4" /> Verify Document
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-3 text-red-600 focus:bg-red-50">
                                             <XCircle className="h-4 w-4" /> Reject (Reason)
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="bg-slate-50 my-1" />
                                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold gap-3 text-slate-400">
                                             <Archive className="h-4 w-4" /> Archive Record
                                          </DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>

            {/* Side Analytics & Reminders */}
            <div className="lg:col-span-3 space-y-6">
               <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden">
                  <CardHeader className="px-6 py-5 border-b border-white/5">
                     <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                        Compliance Health
                        <PieChartIcon className="h-4 w-4 text-emerald-400" />
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                data={ANALYTICS_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={55}
                                paddingAngle={8}
                                dataKey="count"
                              >
                                 {ANALYTICS_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="space-y-2 mt-4">
                        {ANALYTICS_DATA.map(item => (
                           <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                 <span className="text-[9px] font-black uppercase text-white/50">{item.name}</span>
                              </div>
                              <span className="text-[10px] font-black text-white">{item.count}</span>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="px-6 py-5 border-b border-slate-50">
                     <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        Urgent Reminders
                        <AlertCircle className="h-4 w-4 text-red-500" />
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-slate-50">
                        {[
                          { title: 'Visa Expiry', user: 'Amos Burton', days: '2 days left', color: 'bg-red-50 text-red-600' },
                          { title: 'Passport Verification', user: 'Naomi Nagata', days: '7 days pending', color: 'bg-amber-50 text-amber-600' },
                          { title: 'NDA Missing', user: 'James Holden', days: 'High Priority', color: 'bg-indigo-50 text-indigo-600' },
                        ].map((item, i) => (
                           <div key={i} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors group cursor-pointer">
                              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm", item.color)}>
                                 <Mail className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black text-slate-900 truncate">{item.title}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.user}</p>
                              </div>
                              <ChevronRight className="h-3 w-3 text-slate-200 group-hover:text-indigo-600 transition-all" />
                           </div>
                        ))}
                     </div>
                  </CardContent>
                  <div className="p-4 border-t border-slate-50 text-center">
                     <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">
                        Send All Alerts
                     </Button>
                  </div>
               </Card>

               {/* Infrastructure Security Widget */}
               <Card className="border-none shadow-xl bg-emerald-600 text-white rounded-3xl overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                           <Fingerprint className="h-6 w-6 text-white" />
                        </div>
                        <div>
                           <p className="text-sm font-black">Audit Protection</p>
                           <p className="text-[10px] font-bold text-white/70 uppercase">Every access is logged</p>
                        </div>
                     </div>
                     <div className="p-3 rounded-2xl bg-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Cloud className="h-3.5 w-3.5 text-white/60" />
                           <span className="text-[9px] font-black uppercase tracking-widest">S3 Secured</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-100">Live</span>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'NDA Template v2.4', type: 'Legal', usage: 'Used 240 times', icon: FileSignature },
                { title: 'Offer Letter Standard', type: 'HR', usage: 'Used 120 times', icon: FileText },
                { title: 'Relocation Agreement', type: 'Policy', usage: 'Used 45 times', icon: ShieldCheck },
              ].map((template, i) => (
                <Card key={i} className="border-none shadow-xl bg-white rounded-3xl overflow-hidden group hover:shadow-2xl transition-all cursor-pointer">
                   <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                         <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <template.icon className="h-6 w-6" />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{template.type}</span>
                      </div>
                      <CardTitle className="text-lg font-black text-slate-900 leading-tight">{template.title}</CardTitle>
                   </CardHeader>
                   <CardContent className="pt-0 pb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{template.usage}</p>
                      <div className="flex items-center gap-2">
                         <Button className="flex-1 h-10 rounded-xl bg-indigo-600 font-black text-[10px] uppercase tracking-[0.1em]">Use Template</Button>
                         <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><ExternalLink className="h-4 w-4" /></Button>
                      </div>
                   </CardContent>
                </Card>
              ))}
              <Card className="border-2 border-dashed border-slate-200 shadow-none bg-transparent rounded-3xl flex flex-col items-center justify-center p-8 text-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                 <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <Plus className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-sm font-black text-slate-900">Add New Template</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Upload PDF or Docx</p>
                 </div>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Re-importing Plus for the empty template card
import { Plus } from 'lucide-react';
