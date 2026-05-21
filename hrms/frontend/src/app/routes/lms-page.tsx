import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer } from '@/components/ui/drawer';
import { 
  BookOpen, Search, Filter, Loader2, PlayCircle, Users, 
  Trophy, GraduationCap, Clock, Sparkles, 
  ChevronRight, MoreVertical, ShieldCheck,
  TrendingUp, Star, Layout, Book,
  Monitor, Brain, Zap, Activity,
  ArrowUpRight, Download, Share2, Plus,
  Lightbulb, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import axios from 'axios';

// --- Types ---
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: string;
  rating: number;
  progress: number;
  enrolledCount: number;
  instructor: {
    name: string;
    avatar?: string;
  };
}

// --- Mock Data ---
const LMS_SUMMARY = [
  { title: 'Certifications', value: '428', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+12 this week' },
  { title: 'Active Learners', value: '1,240', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '84% Participation' },
  { title: 'Skills Mastered', value: '842', icon: Brain, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'p90 Proficiency' },
  { title: 'Learning Hours', value: '14.2k', icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50', trend: 'Avg 4h/week' },
  { title: 'Course Completion', value: '78%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Industry Lead' },
  { title: 'ROI (Projected)', value: '₹2.4M', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Upskilling Impact' },
];

const MOCK_COURSES: Course[] = [
  {
    id: '1', title: 'Advanced React Architecture', description: 'Mastering micro-frontends and state machines in enterprise apps.',
    category: 'TECHNICAL', level: 'ADVANCED', duration: '12h 45m', rating: 4.9, progress: 65, enrolledCount: 240,
    instructor: { name: 'Dr. Sarah Connor' }
  },
  {
    id: '2', title: 'Strategic Leadership & EQ', description: 'Developing emotional intelligence for high-stakes management.',
    category: 'SOFT SKILLS', level: 'INTERMEDIATE', duration: '8h 20m', rating: 4.8, progress: 0, enrolledCount: 450,
    instructor: { name: 'James Holden' }
  },
  {
    id: '3', title: 'Data Privacy & GDPR 2025', description: 'Essential compliance training for the modern workforce.',
    category: 'COMPLIANCE', level: 'BEGINNER', duration: '3h 15m', rating: 4.7, progress: 100, enrolledCount: 1200,
    instructor: { name: 'Naomi Nagata' }
  },
  {
    id: '4', title: 'AI-First Product Design', description: 'Leveraging LLMs to build next-generation user experiences.',
    category: 'DESIGN', level: 'INTERMEDIATE', duration: '10h 00m', rating: 4.9, progress: 12, enrolledCount: 320,
    instructor: { name: 'Amos Burton' }
  },
];

const COMPLETION_DATA = [
  { name: 'Technical', count: 450, color: '#6366f1' },
  { name: 'Soft Skills', count: 320, color: '#10b981' },
  { name: 'Compliance', count: 880, color: '#f59e0b' },
  { name: 'Design', count: 210, color: '#ec4899' },
];

export function LmsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/lms/courses');
        if (response.data.success && response.data.data.length > 0) {
          // Map backend data to our premium interface
          setCourses(response.data.data.map((c: any) => ({
            ...c,
            category: 'GENERAL',
            level: 'BEGINNER',
            duration: '4h 00m',
            rating: 4.5,
            progress: 0,
            enrolledCount: c._count?.enrollments || 0,
            instructor: { name: 'System Instructor' }
          })));
        } else {
          setCourses(MOCK_COURSES);
        }
      } catch (error) {
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const getLevelStyle = (level: Course['level']) => {
    switch (level) {
      case 'ADVANCED': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'INTERMEDIATE': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'BEGINNER': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Academic Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Knowledge Catalyst</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <GraduationCap className="h-4 w-4 text-indigo-500" />
            AI-Driven Learning • Skill Mapping • Certification Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <Trophy className="h-4 w-4" /> My Awards
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none">
            <Plus className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </div>
      </div>

      {/* 2. Learning Stats */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {LMS_SUMMARY.map((stat, idx) => (
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
                   <Sparkles className="h-3 w-3" /> {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 3. Main Catalog Interface */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Course Catalog */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-black tracking-tight text-slate-900">Curated Curriculum</h2>
                 <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-100">
                    <button onClick={() => setActiveTab('all')} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'all' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600")}>All</button>
                    <button onClick={() => setActiveTab('active')} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'active' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600")}>Ongoing</button>
                    <button onClick={() => setActiveTab('saved')} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'saved' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600")}>Saved</button>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative group min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      placeholder="Search courses..." 
                      className="h-11 pl-11 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Button variant="outline" className="h-11 rounded-2xl px-5 gap-2 border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest"><Filter className="h-4 w-4" /> Filters</Button>
              </div>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-600/10 border-t-indigo-600 animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Optimizing Syllabus...</p>
             </div>
           ) : (
             <div className="grid gap-6 md:grid-cols-2">
                {courses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden group hover:shadow-indigo-100/50 transition-all cursor-pointer border border-slate-50 flex flex-col h-full">
                       <div className="h-48 bg-slate-900 relative overflow-hidden group-hover:h-52 transition-all duration-700">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                          <div className="absolute inset-0 bg-indigo-600/20 group-hover:bg-indigo-600/0 transition-colors duration-700" />
                          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
                             <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {course.rating}
                             </div>
                             <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border", getLevelStyle(course.level))}>
                                {course.level}
                             </div>
                          </div>
                          <div className="absolute bottom-6 left-6 z-20">
                             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">{course.category}</p>
                             <h3 className="text-lg font-black text-white leading-tight">{course.title}</h3>
                          </div>
                          {/* Placeholder for cover image */}
                          <div className="w-full h-full flex items-center justify-center opacity-20 scale-150">
                             <Brain className="h-32 w-32 text-indigo-500" />
                          </div>
                       </div>
                       <CardContent className="p-8 space-y-6 flex-1">
                          <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                          
                          <div className="flex items-center justify-between py-4 border-y border-slate-50">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                   <Users className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-900 uppercase">{course.enrolledCount}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Enrolled</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                   <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-900 uppercase">{course.duration}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Duration</p>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Progress</span>
                                <span className="text-[10px] font-black text-indigo-600">{course.progress}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${course.progress}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="h-full bg-indigo-600 rounded-full" 
                                />
                             </div>
                          </div>
                       </CardContent>
                       <CardFooter className="p-8 pt-0">
                          <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 group">
                             {course.progress > 0 ? 'Resume Learning' : 'Enroll Now'}
                             <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </Button>
                       </CardFooter>
                    </Card>
                  </motion.div>
                ))}
             </div>
           )}
        </div>

        {/* Side Intelligence */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                    Skill Ecosystem
                    <Brain className="h-5 w-5 text-indigo-600" />
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={COMPLETION_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="count"
                          >
                             {COMPLETION_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                             ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.1)' }}
                             itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mt-8">
                    {COMPLETION_DATA.map(item => (
                       <div key={item.name} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="h-1.5 w-8 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                          <p className="text-lg font-black text-slate-900 leading-none">{item.count}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</p>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative space-y-8">
                 <div className="h-16 w-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <Lightbulb className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">AI Tutor Beta</h3>
                    <p className="text-sm font-medium text-white/80 leading-relaxed">
                       Personalized learning paths based on your current project assignment and skill gaps.
                    </p>
                 </div>
                 <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white">
                    Activate Beta
                 </Button>
              </div>
           </Card>

           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-4">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Certification Feed</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-4">
                 {[
                   { user: 'Sarah Connor', award: 'React Architect', time: '10m ago', icon: Trophy, color: 'text-amber-500' },
                   { user: 'James Holden', award: 'EQ Professional', time: '1h ago', icon: ShieldCheck, color: 'text-emerald-500' },
                   { user: 'Naomi Nagata', award: 'GDPR Expert', time: '4h ago', icon: GraduationCap, color: 'text-indigo-500' },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-[28px] bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className={cn("h-11 w-11 rounded-2xl bg-white shadow-sm flex items-center justify-center", log.color)}>
                            <log.icon className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{log.user}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{log.award}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase">{log.time}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
