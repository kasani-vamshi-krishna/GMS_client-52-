

import { useState, useEffect } from 'react';
import api from '../api';
import { 
  CheckCircle2, 
  Loader2, 
  User, 
  Home, 
  MapPin, 
  ArrowRight, 
  ShieldCheck,
  QrCode
} from 'lucide-react';

export default function GuestRegistration() {
  const [formData, setFormData] = useState({ guestName: '', hostName: '', flatNumber: '' });
  const [code, setCode] = useState(null);
  const [status, setStatus] = useState('PENDING'); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/api/guest/register`, formData);
      if (res.data.success) setCode(res.data.entryCode);
    } catch (err) { 
      alert("Unable to connect to server. Please try again."); 
    } finally {
      setLoading(false);
    }
  };

  // Polling Logic
  useEffect(() => {
    let interval;
    if (code && status === 'PENDING') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/guest/status/${code}`);
          if (res.data.success && res.data.status === 'INSIDE') {
            setStatus('INSIDE');
            clearInterval(interval);
          }
        } catch (error) { console.error("Polling Error", error); }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [code, status]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-2 text-slate-700 opacity-80">
        <ShieldCheck className="w-6 h-6 text-indigo-600" />
        <span className="font-bold tracking-wide uppercase text-sm">SecureGate Access</span>
      </div>

      <div className="w-full max-w-md perspective-1000">
        
        {/* SUCCESS STATE */}
        {status === 'INSIDE' ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-green-500 p-10 text-center text-white">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Access Granted</h1>
              <p className="opacity-90 text-sm">You may now enter the premises.</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm mb-6">This pass has been verified and closed.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Start New Check-in
              </button>
            </div>
          </div>
        ) : !code ? (
          /* REGISTRATION FORM */
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/60">
            <div className="bg-indigo-600 p-8 text-white">
              <h1 className="text-2xl font-bold">Visitor Registration</h1>
              <p className="text-indigo-200 text-sm mt-1">Please enter your details to generate an entry pass.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                      required
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                      placeholder="e.g. John Doe"
                      onChange={e => setFormData({...formData, guestName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Visiting Host</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input 
                        required
                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        placeholder="Host Name"
                        onChange={e => setFormData({...formData, hostName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Unit / Flat</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input 
                        required
                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        placeholder="e.g. 101"
                        onChange={e => setFormData({...formData, flatNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Get Entry Pass <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        ) : (
          /* GENERATED PASS (TICKET STYLE) */
          <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
            {/* Top Ticket Stub (Dark) */}
            <div className="bg-slate-900 text-white rounded-t-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Entry Code</p>
                  <div className="text-5xl font-mono font-bold tracking-widest text-indigo-400">{code}</div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl">
                  <QrCode className="w-8 h-8 text-white opacity-80" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium bg-indigo-500/10 py-2 px-4 rounded-full w-fit animate-pulse border border-indigo-500/20">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for security check...
              </div>
            </div>

            {/* Ticket Perforation Effect */}
            <div className="relative h-8 bg-slate-900 overflow-hidden">
               <div className="absolute top-0 w-full h-full bg-white rounded-t-3xl"></div>
               {/* Left Notch */}
               <div className="absolute top-0 -left-4 w-8 h-8 bg-slate-100 rounded-full"></div>
               {/* Right Notch */}
               <div className="absolute top-0 -right-4 w-8 h-8 bg-slate-100 rounded-full"></div>
               {/* Dashed Line */}
               <div className="absolute top-0 left-4 right-4 h-full border-t-2 border-dashed border-slate-300"></div>
            </div>

            {/* Bottom Ticket Body (White) */}
            <div className="bg-white rounded-b-3xl p-8 pt-2 shadow-2xl shadow-slate-300">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <User className="text-indigo-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visitor</p>
                    <p className="text-lg font-bold text-slate-800">{formData.guestName}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <User className="text-orange-600 w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visiting</p>
                    <p className="text-lg font-bold text-slate-800">{formData.hostName}</p>
                  </div>
                  <div className="text-right bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Unit</p>
                    <p className="text-xl font-black text-slate-800">{formData.flatNumber}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                  <span className="flex items-center gap-1"><ShieldCheck size={12}/> Secure Gate System</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 text-xs text-slate-400 font-medium">
        &copy; 2025 SecureEntry Systems. All rights reserved.
      </div>
    </div>
  );
}