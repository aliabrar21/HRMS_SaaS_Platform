import { useState, useEffect } from 'react';
import { 
  X, User, MapPin, Briefcase, Clock, Calendar, 
  Map as MapIcon, Shield, Activity, BarChart3, 
  Monitor, Info, CheckCircle2, AlertCircle, 
  History, MessageSquare, Download, Check
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AttendanceAnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  date: string | null;
  status: string | null;
  data: any;
  loading: boolean;
}

export function AttendanceAnalyticsDrawer({ 
  isOpen, 
  onClose, 
  employeeId, 
  date, 
  status, 
  data, 
  loading 
}: AttendanceAnalyticsDrawerProps) {
  const log = data?.log;
  const employee = log?.employee;
  const productivity = data?.productivity;
  const screenshots = data?.screenshots || [];
  const activities = data?.activities || [];

  const isAbsent = status === 'ABSENT';

  const chartData = [
    { time: '09:00', productivity: 65 },
    { time: '11:00', productivity: 85 },
    { time: '13:00', productivity: 40 },
    { time: '15:00', productivity: 95 },
    { time: '17:00', productivity: 80 },
  ];

  const pieData = [
    { name: 'VS Code', value: 45, color: '#0066FF' },
    { name: 'Chrome', value: 30, color: '#34A853' },
    { name: 'Slack', value: 15, color: '#E01E5A' },
    { name: 'Other', value: 10, color: '#888888' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-full w-full max-w-xl bg-background shadow-2xl flex flex-col border-l"
          >
            {/* STICKY HEADER */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden border">
                  {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{employee?.firstName} {employee?.lastName}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="font-medium text-slate-900">{employee?.employeeCode}</span>
                    <span>•</span>
                    <span>{date ? format(new Date(date), 'dd MMM yyyy') : ''}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={isAbsent ? 'bg-red-500' : 'bg-emerald-500'}>
                  {status}
                </Badge>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                ) : (
                  <>
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="w-full justify-start overflow-x-auto bg-muted/30 p-1 mb-6">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="productivity">Productivity</TabsTrigger>
                        <TabsTrigger value="gps">GPS Logs</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="space-y-8">
                        {isAbsent ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-red-50 border-none shadow-none">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                                  <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider">Consecutive Absents</span>
                                  <span className="text-2xl font-black mt-1 text-red-900">2 Days</span>
                                </CardContent>
                              </Card>
                              <Card className="bg-blue-50 border-none shadow-none">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                  <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                                  <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Attendance %</span>
                                  <span className="text-2xl font-black mt-1 text-blue-900">81%</span>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Absence Risk Analysis</h4>
                              <div className="p-5 rounded-2xl border bg-slate-50/50 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground font-medium">Predicted Reason</span>
                                  <span className="font-bold text-red-600">Unauthorized Absence</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground font-medium">Leave Balance</span>
                                  <span className="font-bold text-slate-900">4.5 Casual Leaves</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground font-medium">Risk Score</span>
                                  <Badge className="bg-orange-500 hover:bg-orange-600 border-none">Medium Risk</Badge>
                                </div>
                                <div className="pt-2 border-t flex items-center gap-3">
                                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></div>
                                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                    "Employee has a pattern of Monday absenteeism over the last 3 months."
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* KPI CARDS */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md cursor-default">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">Check-In</p>
                                <p className="text-sm font-black text-slate-900">{log?.checkInAt ? format(new Date(log.checkInAt), 'hh:mm a') : '09:02 AM'}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md cursor-default">
                                <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">Check-Out</p>
                                <p className="text-sm font-black text-slate-900">{log?.checkOutAt ? format(new Date(log.checkOutAt), 'hh:mm a') : '06:48 PM'}</p>
                              </div>
                              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm transition-all hover:shadow-md cursor-default">
                                <p className="text-[9px] uppercase font-bold text-emerald-800 mb-1 tracking-widest">Work Hours</p>
                                <p className="text-sm font-black text-emerald-600">8h 42m</p>
                              </div>
                            </div>

                            {/* PRODUCTIVITY WIDGET */}
                            <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl overflow-hidden rounded-2xl">
                              <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                      <Activity className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-white/70 block uppercase tracking-widest">Productivity Score</span>
                                      <span className="text-white text-xs opacity-60 font-medium">Based on activity logs</span>
                                    </div>
                                  </div>
                                  <span className="text-4xl font-black text-white">92%</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: '92%' }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                                    ></motion.div>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-white/50 font-bold tracking-widest">
                                    <span>LOW</span>
                                    <span>OPTIMAL</span>
                                    <span>ELITE</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* SHIFT DETAILS */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Shift & Timing</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border bg-slate-50 flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Shift</span>
                                  <span className="text-sm font-bold text-slate-900">{log?.shift?.name || 'General Shift'}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">09:00 AM - 06:00 PM</span>
                                </div>
                                <div className="p-4 rounded-2xl border bg-slate-50 flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Grace Period</span>
                                  <span className="text-sm font-bold text-emerald-600">Within Limit</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">Used: 2 mins / 15 mins</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI INSIGHTS */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Enterprise AI Insights</h4>
                          <div className="space-y-3">
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4 items-start shadow-sm"
                            >
                              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-[13px] text-emerald-900 leading-relaxed">
                                  Employee logged in <span className="font-black text-emerald-700 underline decoration-emerald-300 underline-offset-4">4 mins early</span> today. 
                                  Early logins often correlate with higher daily productivity scores.
                                </p>
                              </div>
                            </motion.div>
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-start shadow-sm"
                            >
                              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Activity className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-[13px] text-blue-900 leading-relaxed">
                                  Productivity is <span className="font-black text-blue-700 underline decoration-blue-300 underline-offset-4">12% higher</span> than average for this department. 
                                  Peak focus hours: <span className="font-bold">10:30 AM - 12:45 PM</span>.
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="gps" className="space-y-6 pt-4">
                        <div className="space-y-4">
                          <div className="aspect-video bg-slate-100 rounded-3xl flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/83.2185,17.3850,13/600x400?access_token=pk.xxx')] bg-cover"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="relative">
                                <div className="absolute inset-0 h-12 w-12 bg-primary/20 rounded-full animate-ping"></div>
                                <div className="relative h-12 w-12 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border shadow-xl flex items-center gap-3">
                              <Shield className="h-4 w-4 text-emerald-500" />
                              <span className="text-xs font-black text-slate-900">VERIFIED GPS LOCATION</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl border bg-slate-50/50 space-y-1">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Punch-In Location</span>
                              <p className="text-xs font-bold text-slate-900">HITEC City Office, Hyderabad</p>
                              <p className="text-[9px] text-muted-foreground font-medium">17.4483° N, 78.3915° E</p>
                            </div>
                            <div className="p-5 rounded-2xl border bg-slate-50/50 space-y-1">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Geofence Status</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-2 py-0.5 text-[10px] font-black tracking-tighter">INSIDE FENCE</Badge>
                                <span className="text-[9px] text-muted-foreground font-medium">Radius: 200m</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="history" className="space-y-6 pt-4">
                        <div className="space-y-4">
                           <h4 className="text-sm font-bold flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Recent Attendance History</h4>
                           <div className="space-y-2">
                             {[...Array(5)].map((_, i) => (
                               <div key={i} className="p-4 rounded-2xl border bg-white flex items-center justify-between hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center">
                                     <span className="text-[10px] font-black text-muted-foreground leading-none">{12-i}</span>
                                     <span className="text-[8px] font-bold text-muted-foreground uppercase leading-none mt-1">MAY</span>
                                   </div>
                                   <div>
                                     <p className="text-sm font-bold text-slate-900">Present</p>
                                     <p className="text-[10px] text-muted-foreground font-medium">Shift: General • 09:04 AM - 06:42 PM</p>
                                   </div>
                                 </div>
                                 <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 text-[10px] font-black tracking-widest">P</Badge>
                               </div>
                             ))}
                           </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-6 pt-4">
                        <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-10">
                          <div className="relative">
                            <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase text-muted-foreground tracking-tighter">09:02 AM</p>
                              <h5 className="text-sm font-bold mt-1">Check-In Successful</h5>
                              <p className="text-[10px] text-muted-foreground mt-1">Logged from <span className="font-medium text-slate-900">Hyderabad Office</span> • IP: 192.168.1.45</p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                            <div>
                              <p className="text-xs font-black uppercase text-muted-foreground tracking-tighter">01:15 PM</p>
                              <h5 className="text-sm font-bold mt-1">Break Started (Lunch)</h5>
                              <p className="text-[10px] text-muted-foreground mt-1">Duration: <span className="font-medium text-slate-900">45 mins</span></p>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-slate-300 border-4 border-white shadow-sm" />
                            <div>
                              <p className="text-xs font-black uppercase text-muted-foreground tracking-tighter">06:48 PM</p>
                              <h5 className="text-sm font-bold mt-1">Check-Out Pending</h5>
                              <p className="text-[10px] text-muted-foreground mt-1">Expected work duration completed.</p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="productivity" className="space-y-8 pt-4">
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                              <Tooltip />
                              <Area type="monotone" dataKey="productivity" stroke="#0066FF" fillOpacity={1} fill="url(#colorProd)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-8 items-center">
                          <div className="h-[140px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={pieData} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-3">
                            {pieData.map(app => (
                              <div key={app.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: app.color }}></div>
                                  <span className="text-[10px] font-bold text-slate-700">{app.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">{app.value}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> Active Monitoring</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="aspect-video bg-slate-100 rounded-lg border group overflow-hidden relative cursor-zoom-in">
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10 text-white">
                                  <Monitor className="h-5 w-5" />
                                </div>
                                <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=200')] bg-cover"></div>
                                <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1 rounded uppercase font-bold">11:04 AM</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* STICKY FOOTER ACTIONS */}
            <div className="p-5 border-t bg-slate-50 flex items-center gap-3 sticky bottom-0 z-10">
              {isAbsent ? (
                <>
                  <Button className="flex-1 h-11 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200">Regularize Absence</Button>
                  <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold text-xs border-slate-300 hover:bg-white">Notify Employee</Button>
                  <Button variant="secondary" size="icon" className="h-11 w-11 rounded-xl shrink-0"><AlertCircle className="h-5 w-5 text-red-600"/></Button>
                </>
              ) : (
                <>
                  <Button className="flex-1 h-11 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Mark Regularization</Button>
                  <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold text-xs border-slate-300 hover:bg-white">Send Message</Button>
                  <Button variant="secondary" size="icon" className="h-11 w-11 rounded-xl shrink-0"><Download className="h-5 w-5"/></Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
