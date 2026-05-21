import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, ShieldCheck, Bell, Share2, 
  CreditCard, Key, Users, Globe, 
  Lock, Mail, Slack, Terminal,
  Cpu, Building2, UserCircle, QrCode,
  Fingerprint, Smartphone, Laptop,
  ChevronRight, ExternalLink, RefreshCw,
  Zap, ArrowRight, ShieldAlert, CheckCircle2,
  MoreVertical, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization');

  const SETTINGS_TABS = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'billing', label: 'Subscription', icon: CreditCard },
    { id: 'api', label: 'Developer API', icon: Terminal },
  ];

  return (
    <div className="pb-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Strategic Hero */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Governance Console</h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Settings className="h-4 w-4 text-indigo-500" />
            Global Configuration • Security Guardrails • Core Identity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-2 border-slate-100">
            <RefreshCw className="h-4 w-4" /> Reset Factory
          </Button>
          <Button className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-white border-none">
            Save All Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* 2. Side Navigation */}
        <div className="lg:col-span-3">
           <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden sticky top-24">
              <CardContent className="p-4">
                 <div className="space-y-1">
                    {SETTINGS_TABS.map((tab) => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={cn(
                           "w-full flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all group relative",
                           activeTab === tab.id 
                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                         )}
                       >
                          <tab.icon className={cn("h-5 w-5", activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                          <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                          {activeTab === tab.id && (
                             <motion.div layoutId="tab-indicator" className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                       </button>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* 3. Main Content Area */}
        <div className="lg:col-span-9">
           <AnimatePresence mode="wait">
              {activeTab === 'organization' && (
                 <motion.div
                   key="org"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                 >
                    <div className="grid gap-8 md:grid-cols-2">
                       <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                          <CardHeader className="p-8 border-b border-slate-50">
                             <CardTitle className="text-xl font-black text-slate-900">Company Identity</CardTitle>
                             <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Foundational Organization Details</CardDescription>
                          </CardHeader>
                          <CardContent className="p-8 space-y-6">
                             <div className="flex items-center gap-6 mb-8">
                                <div className="h-24 w-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-indigo-50 hover:border-indigo-100 transition-all cursor-pointer">
                                   <Building2 className="h-8 w-8 mb-1" />
                                   <span className="text-[8px] font-black uppercase tracking-tighter">Upload Logo</span>
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-lg font-black text-slate-900">VRPI Technologies</h4>
                                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Primary Domain: vrpi.com</p>
                                </div>
                             </div>

                             <div className="grid gap-6">
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Legal Entity Name</Label>
                                   <Input className="h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-600" defaultValue="VRPI Technologies Private Limited" />
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Support Endpoint</Label>
                                   <Input className="h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-600" defaultValue="hr@vrpi.com" />
                                </div>
                             </div>
                          </CardContent>
                       </Card>

                       <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                          <CardHeader className="p-8 border-b border-slate-50">
                             <CardTitle className="text-xl font-black text-slate-900">Localization</CardTitle>
                             <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Regional Defaults & Timezones</CardDescription>
                          </CardHeader>
                          <CardContent className="p-8 space-y-6">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Primary Timezone</Label>
                                <div className="h-14 w-full rounded-2xl border-2 border-slate-100 flex items-center justify-between px-6 bg-slate-50/50 cursor-pointer hover:border-indigo-600 transition-all">
                                   <span className="text-sm font-black text-slate-900">UTC+5:30 (Chennai, Kolkata)</span>
                                   <Globe className="h-4 w-4 text-slate-400" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fiscal Year Start</Label>
                                <div className="h-14 w-full rounded-2xl border-2 border-slate-100 flex items-center justify-between px-6 bg-slate-50/50 cursor-pointer hover:border-indigo-600 transition-all">
                                   <span className="text-sm font-black text-slate-900">April 1st</span>
                                   <Share2 className="h-4 w-4 text-slate-400" />
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                    </div>

                    <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[40px] p-10 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                       <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="space-y-4">
                             <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Zap className="h-7 w-7 text-white" />
                             </div>
                             <div className="space-y-1">
                                <h3 className="text-2xl font-black">Ready for Scaling?</h3>
                                <p className="text-white/70 font-medium text-sm">Automate your onboarding workflow with our new AI Policy Generator.</p>
                             </div>
                          </div>
                          <Button className="h-14 px-8 rounded-2xl bg-white text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shrink-0">Explore Automation</Button>
                       </div>
                    </Card>
                 </motion.div>
              )}

              {activeTab === 'security' && (
                 <motion.div
                   key="sec"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                 >
                    <div className="grid gap-8">
                       <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
                          <CardHeader className="p-8 border-b border-slate-50">
                             <CardTitle className="text-xl font-black text-slate-900">Authentication Protocols</CardTitle>
                             <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Identity & Access Governance</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0">
                             <div className="divide-y divide-slate-50">
                                {[
                                  { title: 'Multi-Factor Auth (MFA)', desc: 'Require biometric or TOTP for all administrative roles.', icon: Fingerprint, active: true },
                                  { title: 'SSO Integration', desc: 'Connect with Google Workspace or Azure AD.', icon: Key, active: false },
                                  { title: 'Password Rotation', desc: 'Enforce 90-day cycle for core stakeholders.', icon: RefreshCw, active: true },
                                  { title: 'IP Whitelisting', desc: 'Restrict access to corporate VPN endpoints.', icon: ShieldAlert, active: false },
                                ].map((sec, i) => (
                                  <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                     <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                           <sec.icon className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                           <h4 className="text-base font-black text-slate-900">{sec.title}</h4>
                                           <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{sec.desc}</p>
                                        </div>
                                     </div>
                                     <div className={cn(
                                       "h-7 w-12 rounded-full p-1 cursor-pointer transition-all",
                                       sec.active ? "bg-indigo-600" : "bg-slate-200"
                                     )}>
                                        <div className={cn("h-5 w-5 rounded-full bg-white shadow-sm transition-all", sec.active && "translate-x-5")} />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </CardContent>
                       </Card>

                       <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[40px] overflow-hidden">
                          <CardContent className="p-8 flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                   <Terminal className="h-7 w-7 text-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-lg font-black">Audit Trail Visibility</p>
                                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tracking last 18,400 security events</p>
                                </div>
                             </div>
                             <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-white/60 hover:text-white">View Full Logs <ArrowRight className="ml-2 h-4 w-4" /></Button>
                          </CardContent>
                       </Card>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
