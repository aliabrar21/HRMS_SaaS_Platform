import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer } from '@/components/ui/drawer';
import { 
  Plus, Search, Filter, Loader2, Users, 
  UserPlus, Mail, ShieldCheck, Activity,
  ChevronRight, MoreVertical, Layout,
  Target, TrendingUp, Sparkles, Star,
  Briefcase, GraduationCap, MapPin, 
  ArrowUpRight, Download, Share2,
  PieChart as PieChartIcon, Heart,
  Baby, Cake, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- Schema ---
const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  employmentCategory: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  workMode: z.enum(['OFFICE', 'WFH', 'HYBRID']),
});
type EmployeeFormData = z.infer<typeof employeeSchema>;

// --- Types ---
interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  joinDate: string;
  status: string;
  department?: { name: string };
  designation?: { name: string };
  progress?: number;
}

// --- Mock Data ---
const HCM_SUMMARY = [
  { title: 'Global Headcount', value: '428', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12 this month' },
  { title: 'Diversity Index', value: '42%', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Target: 45%' },
  { title: 'Retention Rate', value: '98.4%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Top Decile' },
  { title: 'New Starts', value: '14', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Next 30 days' },
  { title: 'Skill Coverage', value: '88%', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'p90 Proficiency' },
  { title: 'Work Mode', value: 'Hybrid', icon: MapPin, color: 'text-violet-600', bg: 'bg-violet-50', trend: '64% Hybrid' },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', employeeCode: 'EMP-001', firstName: 'Sarah', lastName: 'Connor', email: 'sarah.c@acme.com', status: 'ACTIVE', department: { name: 'Engineering' }, designation: { name: 'Principal Engineer' }, joinDate: '2024-01-15' },
  { id: '2', employeeCode: 'EMP-002', firstName: 'James', lastName: 'Holden', email: 'j.holden@acme.com', status: 'ACTIVE', department: { name: 'Operations' }, designation: { name: 'Ops Manager' }, joinDate: '2024-02-20' },
  { id: '3', employeeCode: 'EMP-003', firstName: 'Naomi', lastName: 'Nagata', email: 'n.nagata@acme.com', status: 'ACTIVE', department: { name: 'Engineering' }, designation: { name: 'Lead Architect' }, joinDate: '2024-03-05' },
];

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [designations, setDesignations] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { employmentCategory: 'FULL_TIME', workMode: 'OFFICE' }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, desigRes] = await Promise.all([
        axios.get('/api/employees'),
        axios.get('/api/employees/departments/all'),
        axios.get('/api/employees/designations/all'),
      ]);
      if (empRes.data.success && empRes.data.data.length > 0) setEmployees(empRes.data.data);
      else setEmployees(MOCK_EMPLOYEES);

      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (desigRes.data.success) setDesignations(desigRes.data.data);
    } catch (error) {
      setEmployees(MOCK_EMPLOYEES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    setSubmitting(true);
    try {
      const payload = { 
        ...data, 
        joinDate: new Date(data.joinDate).toISOString(),
        departmentId: data.departmentId || undefined,
        designationId: data.designationId || undefined
      };
      await axios.post('/api/employees', payload);
      setIsDrawerOpen(false);
      reset();
      fetchData();
    } catch (error) {
      console.error('Failed to create employee', error);
      alert('Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Talent Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Talent Directory</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Users className="h-4 w-4 text-indigo-500" />
            Human Capital Management • Global Headcount • Org Intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <Download className="h-4 w-4" /> Export Ledger
          </Button>
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>
      </div>

      {/* 2. HCM KPIs */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {HCM_SUMMARY.map((stat, idx) => (
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

      {/* 3. Operational Ledger */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-black tracking-tight text-slate-900">Personnel Ledger</h2>
                 <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Directory</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative group min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      placeholder="Search name, ID, email..." 
                      className="h-11 pl-11 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="h-11 rounded-2xl px-5 gap-2 border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"><Filter className="h-4 w-4" /> Filters</Button>
              </div>
           </div>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Employee</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Department</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                             <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Join Date</th>
                             <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {loading ? (
                             <tr>
                                <td colSpan={5} className="py-24">
                                   <div className="flex flex-col items-center justify-center gap-4">
                                      <div className="h-12 w-12 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scanning Directory...</p>
                                   </div>
                                </td>
                             </tr>
                          ) : (
                             employees.map((emp, idx) => (
                                <motion.tr 
                                  key={emp.id} 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                >
                                   <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                         <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 shadow-sm relative">
                                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Online" />
                                         </div>
                                         <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate">{emp.firstName} {emp.lastName}</p>
                                            <div className="flex items-center gap-2">
                                               <span className="text-[10px] font-bold text-slate-400 uppercase">{emp.employeeCode}</span>
                                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                                               <span className="text-[10px] font-bold text-slate-400 truncate w-32">{emp.email}</span>
                                            </div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5">
                                      <div className="space-y-1">
                                         <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{emp.department?.name || 'Unassigned'}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{emp.designation?.name || 'General'}</p>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5">
                                      <span className={cn(
                                         "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border",
                                         emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                      )}>
                                         <div className={cn("h-1.5 w-1.5 rounded-full", emp.status === 'ACTIVE' ? "bg-emerald-500" : "bg-slate-400")} />
                                         {emp.status}
                                      </span>
                                   </td>
                                   <td className="px-8 py-5">
                                      <div className="flex flex-col">
                                         <span className="text-xs font-black text-slate-700">{new Date(emp.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Anniversary in 4m</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                         <Link to={`/employees/${emp.id}`}>
                                            <Button variant="ghost" className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-600 hover:bg-indigo-50">View Profile</Button>
                                         </Link>
                                         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100"><MoreVertical className="h-5 w-5 text-slate-400" /></Button>
                                      </div>
                                   </td>
                                </motion.tr>
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
                    Pulse Board
                    <Activity className="h-5 w-5 text-indigo-600" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                   { label: 'Work Anniversaries', count: 4, icon: Cake, color: 'text-rose-600', bg: 'bg-rose-50' },
                   { label: 'New Birthdays', count: 2, icon: Baby, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                   { label: 'Open Positions', count: 8, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-5 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
                            <item.icon className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-lg font-black text-slate-900 leading-none">{item.count}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                         </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                   </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-8">
                 <div className="h-16 w-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Smart Org Chart</h3>
                    <p className="text-sm font-medium text-white/60 leading-relaxed">
                       Visualize reporting structures and team dynamics in real-time.
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white">
                    Open Visualizer
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden border border-slate-50">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Audit Trail
                    <History className="h-4 w-4" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { user: 'Sarah Connor', action: 'Designation Updated', time: '10m ago' },
                   { user: 'James Holden', action: 'Department Changed', time: '1h ago' },
                   { user: 'Naomi Nagata', action: 'New Asset Assigned', time: '4h ago' },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-[24px] bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-[8px] font-black text-indigo-600">SC</div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-900 uppercase truncate">{log.user}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate w-24">{log.action}</p>
                         </div>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">{log.time}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
