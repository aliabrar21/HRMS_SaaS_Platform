import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, Save, X, User, MapPin, Briefcase, Mail, Phone, 
  CreditCard, FileText, AlertCircle, Shield, History, Clock, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const editSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  workMode: z.string(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  phone: z.string().optional(),
  aadhaar: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
});
type EditFormData = z.infer<typeof editSchema>;

const SECTIONS = [
  { id: 'basic', label: 'Basic Information', icon: User },
  { id: 'personal', label: 'Personal Details', icon: MapPin },
  { id: 'work', label: 'Work Information', icon: Briefcase },
  { id: 'contact', label: 'Contact Information', icon: Phone },
  { id: 'compensation', label: 'Compensation', icon: Calculator },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'bank', label: 'Bank & Tax', icon: CreditCard },
  { id: 'emergency', label: 'Emergency Contact', icon: AlertCircle },
  { id: 'system', label: 'System Access', icon: Shield },
];

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [designations, setDesignations] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes, desigRes] = await Promise.all([
          axios.get(`/api/employees/${id}`),
          axios.get('/api/employees/departments/all'),
          axios.get('/api/employees/designations/all'),
        ]);
        if (empRes.data.success) {
          const emp = empRes.data.data;
          setEmployee(emp);
          reset({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            workMode: emp.workMode || 'OFFICE',
            departmentId: emp.departmentId || '',
            designationId: emp.designationId || '',
          });
        }
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (desigRes.data.success) setDesignations(desigRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollPosition = containerRect.top + 150; // Detection threshold
      
      let currentActive = SECTIONS[0].id;
      for (let i = 0; i < SECTIONS.length; i++) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= scrollPosition) {
            currentActive = SECTIONS[i].id;
          }
        }
      }
      setActiveSection(currentActive);
    };
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const scrollContainer = document.querySelector('main');
    if (element && scrollContainer) {
      const elementRect = element.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      // Calculate exact position inside the scroll container, minus a top margin
      const y = elementRect.top - containerRect.top + scrollContainer.scrollTop - 24;
      scrollContainer.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const onSubmit = async (data: EditFormData) => {
    setSubmitting(true);
    try {
      await axios.put(`/api/employees/${id}`, data);
      navigate(`/employees/${id}`);
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

  if (!employee) return <div className="p-10 text-center">Employee not found.</div>;

  return (
    <div className="bg-[#F7F8FA] min-h-screen pb-32">
      {/* TOP HEADER */}
      <div className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <Link to="/employees" className="hover:text-primary">Employees</Link>
            <span className="mx-2">/</span>
            <Link to={`/employees/${id}`} className="hover:text-primary">{employee.employeeCode}</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">Edit Profile</span>
          </div>
          <h1 className="text-xl font-bold flex items-center gap-3">
            {employee.firstName} {employee.lastName}
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">{employee.status}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/employees/${id}`)}><X className="mr-2 h-4 w-4"/> Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={submitting}>
            <Save className="mr-2 h-4 w-4"/> {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="w-64 shrink-0 hidden lg:block sticky top-32">
            <nav className="space-y-1 bg-white p-2 rounded-xl border shadow-sm">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <section.icon className={`h-4 w-4 ${activeSection === section.id ? 'text-primary' : 'text-slate-400'}`} />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* MAIN FORM CONTENT */}
          <div className="flex-1 space-y-8">
            <form id="edit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              <section id="basic" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name <span className="text-red-500">*</span></Label>
                      <Input {...register('firstName')} />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name <span className="text-red-500">*</span></Label>
                      <Input {...register('lastName')} />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Work Email <span className="text-red-500">*</span></Label>
                      <Input type="email" {...register('email')} />
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input value={employee.employeeCode} disabled className="bg-slate-50" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="personal" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Aadhaar Number</Label>
                      <Input placeholder="XXXX-XXXX-XXXX" {...register('aadhaar')} />
                    </div>
                    <div className="space-y-2">
                      <Label>PAN Number</Label>
                      <Input placeholder="XXXXX0000X" {...register('pan')} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Current Address</Label>
                      <Input placeholder="Full Address" {...register('address')} />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="work" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Work Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register('departmentId')}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Designation</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register('designationId')}>
                        <option value="">Select Designation</option>
                        {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register('workMode')}>
                        <option value="OFFICE">Office</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="WFH">Work From Home</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Employment Category</Label>
                      <Input value={employee.employmentCategory} disabled className="bg-slate-50" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="contact" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input type="tel" {...register('phone')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slack / Teams ID</Label>
                      <Input placeholder="@username" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="compensation" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Compensation (HR Only)</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Current CTC (Annual)</Label>
                      <Input placeholder="₹ 0.00" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label>Basic Salary</Label>
                      <Input placeholder="₹ 0.00" type="number" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="documents" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center">
                      <FileText className="h-10 w-10 text-slate-300 mb-2"/>
                      <p className="text-sm font-medium">Drag & drop files here</p>
                      <p className="text-xs text-muted-foreground mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                      <Button variant="outline" size="sm" className="mt-4" type="button">Browse Files</Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="bank" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Bank & Tax Details</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input {...register('bankName')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input {...register('accountNumber')} />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input {...register('ifsc')} />
                    </div>
                    <div className="space-y-2">
                      <Label>UAN Number</Label>
                      <Input />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section id="emergency" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>Contact Name</Label><Input /></div>
                    <div className="space-y-2"><Label>Relationship</Label><Input /></div>
                    <div className="space-y-2"><Label>Phone Number</Label><Input /></div>
                  </CardContent>
                </Card>
              </section>

              <section id="system" className="scroll-mt-32">
                <Card>
                  <CardHeader><CardTitle>System Access</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>Role</Label><Input value="Employee" disabled className="bg-slate-50"/></div>
                    <div className="space-y-2"><Label>Account Status</Label><Input value="Active" disabled className="bg-slate-50 text-emerald-600 font-bold"/></div>
                  </CardContent>
                </Card>
              </section>
            </form>
          </div>

          {/* RIGHT SUMMARY PANEL */}
          <div className="w-80 shrink-0 hidden xl:block sticky top-32">
            <Card>
              <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-sm">Profile Summary</CardTitle></CardHeader>
              <CardContent className="p-4 space-y-4 text-sm">
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-2">
                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                  </div>
                  <Button variant="ghost" size="sm" type="button">Change Avatar</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold"><span className="text-muted-foreground">Profile Completion</span><span className="text-emerald-600">85%</span></div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                  </div>
                </div>

                <hr className="my-4"/>

                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Attendance</span><span className="font-semibold">96%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Leaves Left</span><span className="font-semibold">12.5 Days</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pending Tasks</span><span className="font-semibold text-amber-600">3</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* STICKY FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50 shadow-[0_-4px_15px_-3px_rgb(0,0,0,0.1)]">
        <div className="max-w-[1600px] mx-auto flex justify-end gap-3 px-6">
          <Button variant="outline" onClick={() => navigate(`/employees/${id}`)} type="button">Discard Changes</Button>
          <Button variant="secondary" type="button">Save Draft</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={submitting} type="submit" form="edit-form">
            <Save className="mr-2 h-4 w-4"/> {submitting ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </div>

    </div>
  );
}
