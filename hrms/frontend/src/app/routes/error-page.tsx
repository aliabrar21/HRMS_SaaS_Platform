import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, ChevronLeft } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage: string;
  let errorStatus: number | string = 'Error';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'An unexpected error has occurred.';
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-rose-600/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full text-center space-y-10 relative"
      >
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-[32px] bg-rose-500/20 border border-rose-500/30 text-rose-500 mb-4">
          <AlertTriangle className="h-12 w-12" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter text-white">
            {errorStatus}
          </h1>
          <h2 className="text-2xl font-bold text-slate-300">System Interruption</h2>
          <p className="text-lg text-slate-400 font-medium leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md italic">
            "{errorMessage}"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-14 px-8 rounded-2xl border-2 border-white/10 hover:bg-white/5 text-white font-black uppercase text-xs tracking-widest w-full sm:w-auto"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            className="h-14 px-8 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black uppercase text-xs tracking-widest w-full sm:w-auto shadow-xl shadow-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>

          <Button 
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="h-14 px-8 rounded-2xl hover:bg-white/5 text-slate-400 hover:text-white font-black uppercase text-xs tracking-widest w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" /> Terminal Home
          </Button>
        </div>

        <div className="pt-10 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            Antigravity Performance Intelligence • Status: Degraded
          </p>
        </div>
      </motion.div>
    </div>
  );
}
