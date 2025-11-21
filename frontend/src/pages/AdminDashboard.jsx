import { useState, useEffect } from 'react';
import { UserPlus, LogOut, RefreshCw, Users, Clock, Activity, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, inside: 0, exited: 0, pending: 0 });
  const [watchmen, setWatchmen] = useState([]);
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const statRes = await api.get(`/api/admin/stats`);
      if (statRes.data.success) setStats(statRes.data.stats);

      const staffRes = await api.get(`/api/admin/watchmen`);
      if (staffRes.data.success) setWatchmen(staffRes.data.watchmen);

    } catch (error) { 
      console.error("Error fetching data"); 
    }
  };

  useEffect(() => { fetchData(); }, []);
  
  const addWatchman = async () => {
    if(!form.username || !form.password) return alert("Fill fields");
    const res = await api.post(`/api/admin/add-watchman`, form);
    if(res.data.success) { 
      alert("Watchman Added"); 
      setForm({username:'', password:''}); 
      fetchData(); 
    } else {
      alert(res.data.message);
    }
  };

  const deleteWatchman = async (id) => {
    if(window.confirm("Remove this staff member?")) {
      await api.delete(`/api/admin/watchman/${id}`);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg shadow-lg">
             <Activity size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Admin<span className="text-indigo-600">Portal</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData} 
            className="p-2 text-slate-400 hover:text-indigo-600 rounded-full transition-all hover:bg-slate-100"
          >
            <RefreshCw size={20}/>
          </button>

          <button 
            onClick={() => {localStorage.clear(); navigate('/login')}} 
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition"
          >
            <LogOut size={16}/> Logout
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard title="Active Guests" value={stats.inside} icon={<Users size={24}/>} color="text-green-600" bg="bg-green-100" />
           <StatCard title="Pending Entry" value={stats.pending} icon={<Clock size={24}/>} color="text-amber-600" bg="bg-amber-100" />
           <StatCard title="Total Exited" value={stats.exited} icon={<LogOut size={24}/>} color="text-slate-600" bg="bg-slate-100" />
           <StatCard title="Total Visits" value={stats.total} icon={<Activity size={24}/>} color="text-indigo-600" bg="bg-indigo-100" />
        </div>

        {/* History Button Updated */}
        <div 
          onClick={() => navigate('/admin/history')}
          className="
            bg-gradient-to-r from-blue-600 to-indigo-700 
            rounded-2xl p-8 text-white shadow-xl cursor-pointer 
            transform hover:-translate-y-1 transition-all 
            flex justify-between items-center
          "
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">Visitor History & Tracking</h2>
            <p className="text-blue-100">View detailed logs, filter by date/plate, and view captured images.</p>
          </div>

          <div className="text-xl font-bold opacity-90">
            ENTER →
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Watchman List */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Shield size={20} className="text-indigo-600"/> Security Staff Directory
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {watchmen.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400">No staff found.</td>
                    </tr>
                  ) : (
                    watchmen.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{user.username}</td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteWatchman(user._id)} 
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Watchman Form */}
          <div className="bg-slate-900 rounded-3xl shadow-xl text-white p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg"><UserPlus size={20}/></div>
              <h3 className="font-bold text-lg">Add Credentials</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mt-1" 
                  value={form.username} 
                  onChange={e=>setForm({...form, username: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
                <input 
                  type="password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mt-1" 
                  value={form.password} 
                  onChange={e=>setForm({...form, password: e.target.value})}
                />
              </div>

              <button 
                onClick={addWatchman} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold shadow-lg transition-all mt-4"
              >
                Create Account
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const StatCard = ({ title, value, icon, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h2 className="text-3xl font-black text-slate-800">{value}</h2>
    </div>
    <div className={`p-4 rounded-xl ${bg} ${color}`}>
      {icon}
    </div>
  </div>
);
