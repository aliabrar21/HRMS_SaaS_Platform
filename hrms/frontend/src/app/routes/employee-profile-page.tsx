import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, Download, Mail, MoreHorizontal, User, 
  MapPin, Briefcase, Calendar, CheckCircle, 
  Clock, Activity, FileText, AlertCircle, Laptop, Settings, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer } from '@/components/ui/drawer';

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  workMode: z.string().min(1, 'Required')
});
type EditFormData = z.infer<typeof editSchema>;

export function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`/api/employees/${id}`);
      if (response.data.success) {
        setEmployee(response.data.data);
        reset({
          firstName: response.data.data.firstName,
          lastName: response.data.data.lastName,
          email: response.data.data.email,
          workMode: response.data.data.workMode,
        });
      }
    } catch (error) {
      console.error('Failed to fetch employee', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const onEditSubmit = async (data: EditFormData) => {
    setSubmitting(true);
    try {
      await axios.put(`/api/employees/${id}`, data);
      setIsEditDrawerOpen(false);
      fetchEmployee();
    } catch (error) {
      console.error(error);
      alert('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!employee) {
    return <div className="p-10 text-center">Employee not found.</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link to="/employees" className="flex items-center hover:text-primary transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Directory
        </Link>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border-4 border-white shadow-sm">
            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                {employee.status}
              </span>
            </div>
            <p className="text-muted-foreground font-medium">{employee.designation?.name || 'No Designation'} • {employee.department?.name || 'No Department'}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center"><Briefcase className="mr-1 h-4 w-4"/> {employee.employeeCode}</span>
              <span className="flex items-center"><MapPin className="mr-1 h-4 w-4"/> {employee.workMode}</span>
              <span className="flex items-center"><Calendar className="mr-1 h-4 w-4"/> Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => alert('Opening messaging app...')}><Mail className="mr-2 h-4 w-4" /> Message</Button>
          <Button variant="outline" onClick={() => window.print()}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Link to={`/employees/${id}/edit`}>
            <Button>Edit Profile</Button>
          </Link>
          <Button variant="outline" size="icon" onClick={() => alert('More actions menu')}><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MAIN TABS CONTENT */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-12 p-0 space-x-6">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Overview</TabsTrigger>
              <TabsTrigger value="personal" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Personal</TabsTrigger>
              <TabsTrigger value="work" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Work</TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Attendance</TabsTrigger>
              <TabsTrigger value="leave" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Leave</TabsTrigger>
              <TabsTrigger value="payroll" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Payroll</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Docs</TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Assets</TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Performance</TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Timeline</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Logs</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none bg-transparent px-0">Notes</TabsTrigger>
            </TabsList>

            {/* TAB: OVERVIEW */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground text-sm mb-1">Leave Balance</span>
                    <span className="text-3xl font-bold text-slate-900">12.5</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground text-sm mb-1">Attendance %</span>
                    <span className="text-3xl font-bold text-emerald-600">96%</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground text-sm mb-1">Assets</span>
                    <span className="text-3xl font-bold text-blue-600">2</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground text-sm mb-1">Perf. Rating</span>
                    <span className="text-3xl font-bold text-amber-500">4.5</span>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-4">
                    <div className="grid grid-cols-2 gap-1"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{employee.email}</span></div>
                    <div className="grid grid-cols-2 gap-1"><span className="text-muted-foreground">Phone:</span> <span className="font-medium">+91 9876543210</span></div>
                    <div className="grid grid-cols-2 gap-1"><span className="text-muted-foreground">Reporting To:</span> <span className="font-medium text-primary cursor-pointer hover:underline">Suresh Kumar</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 group-[.is-active]:bg-emerald-500 group-[.is-active]:text-emerald-50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"><CheckCircle size={16}/></div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white">
                        <div className="flex items-center justify-between space-x-2 mb-1"><div className="font-bold text-slate-900">Leave Approved</div><time className="text-xs text-emerald-600 font-medium">May 12</time></div>
                        <div className="text-slate-500 text-xs">Sick leave approved by Suresh Kumar.</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: PERSONAL INFO */}
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-y-6 gap-x-10 text-sm">
                  <div className="space-y-1"><p className="text-muted-foreground">Full Name</p><p className="font-medium">{employee.firstName} {employee.lastName}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Gender</p><p className="font-medium">Male</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Date of Birth</p><p className="font-medium">15 Aug 1990</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Blood Group</p><p className="font-medium">O+</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Marital Status</p><p className="font-medium">Single</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Nationality</p><p className="font-medium">Indian</p></div>
                  <div className="space-y-1 md:col-span-2"><p className="text-muted-foreground">Current Address</p><p className="font-medium">123, Hitech City, Phase 2, Hyderabad, Telangana, 500081</p></div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: WORK INFO */}
            <TabsContent value="work" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Work Information</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-y-6 gap-x-10 text-sm">
                  <div className="space-y-1"><p className="text-muted-foreground">Department</p><p className="font-medium">{employee.department?.name || 'N/A'}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Designation</p><p className="font-medium">{employee.designation?.name || 'N/A'}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Employment Category</p><p className="font-medium">{employee.employmentCategory}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Work Mode</p><p className="font-medium">{employee.workMode}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Date of Joining</p><p className="font-medium">{new Date(employee.joinDate).toLocaleDateString()}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground">Probation End Date</p><p className="font-medium">15 Aug 2026</p></div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: ATTENDANCE */}
            <TabsContent value="attendance" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Attendance & Timesheets</CardTitle><Button variant="outline" size="sm" onClick={() => window.print()}>Download Report</Button></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100"><p className="text-emerald-800 text-sm font-medium">On-Time Arrivals</p><h4 className="text-2xl font-bold text-emerald-600 mt-1">18 Days</h4></div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100"><p className="text-amber-800 text-sm font-medium">Late Marks</p><h4 className="text-2xl font-bold text-amber-600 mt-1">2 Days</h4></div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100"><p className="text-blue-800 text-sm font-medium">Avg Working Hours</p><h4 className="text-2xl font-bold text-blue-600 mt-1">8h 45m</h4></div>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Check In</th><th className="px-4 py-3">Check Out</th><th className="px-4 py-3">Total Hrs</th><th className="px-4 py-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="px-4 py-3">May 12, 2026</td><td className="px-4 py-3 font-medium">09:15 AM</td><td className="px-4 py-3">06:30 PM</td><td className="px-4 py-3">9h 15m</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">PRESENT</span></td></tr>
                      <tr><td className="px-4 py-3">May 11, 2026</td><td className="px-4 py-3 font-medium">10:05 AM</td><td className="px-4 py-3">07:10 PM</td><td className="px-4 py-3">9h 05m</td><td className="px-4 py-3"><span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs font-semibold">LATE</span></td></tr>
                      <tr><td className="px-4 py-3">May 10, 2026</td><td className="px-4 py-3 font-medium">-</td><td className="px-4 py-3">-</td><td className="px-4 py-3">0h 00m</td><td className="px-4 py-3"><span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">WEEKEND</span></td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: LEAVE */}
            <TabsContent value="leave" className="mt-6 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-muted-foreground text-sm">Casual Leave</p><h4 className="text-2xl font-bold mt-1">4.0</h4><p className="text-xs text-muted-foreground mt-1">out of 10</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-muted-foreground text-sm">Sick Leave</p><h4 className="text-2xl font-bold mt-1 text-emerald-600">6.0</h4><p className="text-xs text-muted-foreground mt-1">out of 10</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-muted-foreground text-sm">Earned Leave</p><h4 className="text-2xl font-bold mt-1">2.5</h4><p className="text-xs text-muted-foreground mt-1">out of 15</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-muted-foreground text-sm">Comp Off</p><h4 className="text-2xl font-bold mt-1 text-blue-600">1.0</h4><p className="text-xs text-muted-foreground mt-1">available</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
                <CardContent>
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr><th className="px-4 py-3">Date Range</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Days</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="px-4 py-3">Apr 15 - Apr 16, 2026</td><td className="px-4 py-3">Sick Leave</td><td className="px-4 py-3">2</td><td className="px-4 py-3 text-muted-foreground">Fever</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">APPROVED</span></td></tr>
                      <tr><td className="px-4 py-3">Mar 02, 2026</td><td className="px-4 py-3">Casual Leave</td><td className="px-4 py-3">1</td><td className="px-4 py-3 text-muted-foreground">Personal work</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">APPROVED</span></td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PAYROLL */}
            <TabsContent value="payroll" className="mt-6 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Salary Overview</CardTitle><Button size="sm">Revise Salary</Button></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4 border-b pb-2">Earnings</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Basic</span><span className="font-medium">₹ 40,000</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">HRA</span><span className="font-medium">₹ 20,000</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Special Allowance</span><span className="font-medium">₹ 15,000</span></div>
                      <div className="flex justify-between pt-2 border-t font-bold text-slate-900"><span>Gross Earnings</span><span>₹ 75,000</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4 border-b pb-2">Deductions</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">PF Contribution</span><span className="font-medium text-red-600">- ₹ 1,800</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Professional Tax</span><span className="font-medium text-red-600">- ₹ 200</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">TDS</span><span className="font-medium text-red-600">- ₹ 3,500</span></div>
                      <div className="flex justify-between pt-2 border-t font-bold text-slate-900"><span>Total Deductions</span><span className="text-red-600">- ₹ 5,500</span></div>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-slate-900 text-white p-4 rounded-lg flex justify-between items-center">
                    <span className="font-semibold">Net Take Home (Monthly)</span><span className="text-xl font-bold">₹ 69,500</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Recent Payslips</CardTitle></CardHeader>
                <CardContent>
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr><th className="px-4 py-3">Month</th><th className="px-4 py-3">Gross</th><th className="px-4 py-3">Net Pay</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="px-4 py-3 font-medium">April 2026</td><td className="px-4 py-3 text-muted-foreground">₹ 75,000</td><td className="px-4 py-3 font-semibold">₹ 69,500</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">PAID</span></td><td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Download</Button></td></tr>
                      <tr><td className="px-4 py-3 font-medium">March 2026</td><td className="px-4 py-3 text-muted-foreground">₹ 75,000</td><td className="px-4 py-3 font-semibold">₹ 69,500</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">PAID</span></td><td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Download</Button></td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: DOCUMENTS */}
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Employee Documents</CardTitle><Button size="sm"><Plus className="mr-2 h-4 w-4"/> Upload Document</Button></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-pointer group">
                      <FileText className="h-10 w-10 text-red-500 mb-3 group-hover:scale-110 transition-transform"/>
                      <h4 className="font-semibold text-sm">Aadhaar Card.pdf</h4>
                      <p className="text-xs text-muted-foreground mt-1">Identity Proof</p>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mt-3">Verified</span>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-pointer group">
                      <FileText className="h-10 w-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform"/>
                      <h4 className="font-semibold text-sm">PAN Card.pdf</h4>
                      <p className="text-xs text-muted-foreground mt-1">Tax Document</p>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mt-3">Verified</span>
                    </div>
                    <div className="border rounded-lg p-4 flex flex-col items-center text-center hover:border-primary transition-colors cursor-pointer group">
                      <FileText className="h-10 w-10 text-emerald-500 mb-3 group-hover:scale-110 transition-transform"/>
                      <h4 className="font-semibold text-sm">Offer Letter.pdf</h4>
                      <p className="text-xs text-muted-foreground mt-1">Company Document</p>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-3">Signed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: ASSETS */}
            <TabsContent value="assets" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Assigned Equipment</CardTitle><Button size="sm"><Plus className="mr-2 h-4 w-4"/> Assign Asset</Button></CardHeader>
                <CardContent>
                  <table className="w-full text-sm text-left border rounded-md overflow-hidden">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr><th className="px-4 py-3">Asset Code</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Model</th><th className="px-4 py-3">Assigned Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-muted/50"><td className="px-4 py-3 font-medium">LPT-2026-042</td><td className="px-4 py-3 text-muted-foreground flex items-center"><Laptop className="mr-2 h-4 w-4"/> Laptop</td><td className="px-4 py-3">MacBook Pro M3</td><td className="px-4 py-3 text-muted-foreground">Jan 10, 2026</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">ACTIVE</span></td><td className="px-4 py-3 text-right"><Button variant="outline" size="sm">Recover</Button></td></tr>
                      <tr className="hover:bg-muted/50"><td className="px-4 py-3 font-medium">MNT-2026-081</td><td className="px-4 py-3 text-muted-foreground flex items-center">Monitor</td><td className="px-4 py-3">Dell UltraSharp 27"</td><td className="px-4 py-3 text-muted-foreground">Jan 10, 2026</td><td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">ACTIVE</span></td><td className="px-4 py-3 text-right"><Button variant="outline" size="sm">Recover</Button></td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PERFORMANCE */}
            <TabsContent value="performance" className="mt-6 space-y-6">
              <Card>
                <CardHeader><CardTitle>Performance Reviews</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">Q1 2026 Appraisal</h4>
                          <p className="text-sm text-muted-foreground">Reviewer: Suresh Kumar • Completed on Apr 05, 2026</p>
                        </div>
                        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-center"><p className="text-xs font-bold uppercase">Rating</p><p className="text-2xl font-black">4.5</p></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-semibold text-slate-700">Manager Comments:</span> Excellent ownership of the Q1 product roadmap. Consistently delivered features ahead of schedule. Needs slight improvement in cross-department communication.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: TIMELINE */}
            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Employee Timeline</CardTitle></CardHeader>
                <CardContent className="px-8">
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 py-4">
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 rounded-full bg-blue-500 border-4 border-white -left-[9px] top-1"></div>
                      <h4 className="font-bold text-slate-900 text-sm">Promoted to Senior Developer</h4>
                      <p className="text-xs text-muted-foreground mt-1">Jan 01, 2026</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 rounded-full bg-slate-300 border-4 border-white -left-[9px] top-1"></div>
                      <h4 className="font-bold text-slate-900 text-sm">Joined the Company</h4>
                      <p className="text-xs text-muted-foreground mt-1">Aug 15, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: ACTIVITY LOGS */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Activity Logs</CardTitle></CardHeader>
                <CardContent>
                  <table className="w-full text-sm text-left border rounded-md">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">IP Address</th><th className="px-4 py-3">Device</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="px-4 py-3 text-muted-foreground">May 13, 2026, 09:15 AM</td><td className="px-4 py-3 font-medium">Portal Login</td><td className="px-4 py-3 font-mono text-xs text-slate-500">192.168.1.45</td><td className="px-4 py-3 text-muted-foreground">Chrome on Mac OS</td></tr>
                      <tr><td className="px-4 py-3 text-muted-foreground">May 12, 2026, 06:30 PM</td><td className="px-4 py-3 font-medium">Logged Out</td><td className="px-4 py-3 font-mono text-xs text-slate-500">192.168.1.45</td><td className="px-4 py-3 text-muted-foreground">Chrome on Mac OS</td></tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: NOTES */}
            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Internal HR Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2"><h5 className="font-semibold text-yellow-800 text-sm">Probation Extension Discussion</h5><span className="text-xs text-yellow-600">Apr 10, 2026</span></div>
                    <p className="text-sm text-yellow-900">Discussed performance metrics required for confirmation. Next review scheduled for July.</p>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Input placeholder="Type a private note..." className="flex-1" />
                    <Button>Add Note</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>

        {/* RIGHT SIDEBAR QUICK PANEL */}
        <div className="hidden lg:block space-y-6">
          <Card className="sticky top-20">
            <CardHeader className="bg-muted/50 pb-4"><CardTitle className="text-sm">Quick Information</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground"/><span className="truncate">{employee.email}</span></div>
              <div className="flex items-center gap-3"><AlertCircle className="h-4 w-4 text-amber-500"/><span>1 Pending Task</span></div>
              <div className="flex items-center gap-3"><Laptop className="h-4 w-4 text-blue-500"/><span>2 Active Assets</span></div>
              
              <hr className="my-4"/>
              
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Quick Actions</p>
                <Button variant="outline" className="w-full justify-start text-xs"><Clock className="mr-2 h-3 w-3" /> Approve Timesheet</Button>
                <Button variant="outline" className="w-full justify-start text-xs"><FileText className="mr-2 h-3 w-3" /> Issue Warning</Button>
                <Button variant="outline" className="w-full justify-start text-xs text-red-600 hover:text-red-700 hover:bg-red-50"><Settings className="mr-2 h-3 w-3" /> Deactivate Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
