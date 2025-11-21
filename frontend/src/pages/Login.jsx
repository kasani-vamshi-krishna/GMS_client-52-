
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ChevronRight } from 'lucide-react';
import api from '../api';

export default function Login() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post(`/api/login`, creds);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        // Add a slight delay for the button animation to finish
        setTimeout(() => {
           if (res.data.role === 'ADMIN') navigate('/admin');
           if (res.data.role === 'WATCHMAN') navigate('/watchman');
        }, 500);
      } else {
        alert(res.data.message);
      }
    } catch (err) { alert("Server Error"); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-dark rounded-3xl p-8 border-t border-white/10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4 transform rotate-3 hover:rotate-0 transition-all duration-300">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Secure Access</h2>
            <p className="text-slate-400 mt-2">GMS Staff Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-12 py-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                  placeholder="Enter ID"
                  value={creds.username}
                  onChange={e => setCreds({...creds, username: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  type="password"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-12 py-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                  placeholder="••••••••"
                  value={creds.password}
                  onChange={e => setCreds({...creds, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full group relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full"></div>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? 'Authenticating...' : 'Sign In Dashboard'}
                {!isLoading && <ChevronRight size={18} />}
              </span>
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-sm mt-6">
          Restricted Area. Authorized Personnel Only.
        </p>
      </div>
    </div>
  );
}