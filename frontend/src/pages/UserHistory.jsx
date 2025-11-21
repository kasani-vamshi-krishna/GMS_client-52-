
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Calendar, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function UserHistory() {
  const navigate = useNavigate();

  
  const [allLogs, setAllLogs] = useState([]);

  
  const [logs, setLogs] = useState([]);

  
  const [loading, setLoading] = useState(false);

  
  const [page, setPage] = useState(1);
  const limit = 10;

  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedOriginal, setSelectedOriginal] = useState(null);

  
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/history?page=1&limit=10000`);
      if (res.data.success) {
        setAllLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  
  useEffect(() => {
    let filtered = [...allLogs];

  
    if (search.trim() !== '') {
      const s = search.toLowerCase();
      filtered = filtered.filter(log =>
        log.guestName?.toLowerCase().includes(s) ||
        log.hostName?.toLowerCase().includes(s) ||
        log.plateNumber?.toLowerCase().includes(s) ||
        log.entryCode?.toLowerCase().includes(s)
      );
    }

  
    if (statusFilter !== '') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

  
    if (startDate) {
      filtered = filtered.filter(log => new Date(log.entryTime) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(log => new Date(log.entryTime) <= new Date(endDate));
    }

  
    const start = (page - 1) * limit;
    const end = start + limit;

    setLogs(filtered.slice(start, end));
    setTotalRecords(filtered.length);
    setTotalPages(Math.ceil(filtered.length / limit));
  }, [search, statusFilter, startDate, endDate, page, allLogs]);

  
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
  
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">History & Tracking</h1>
        </div>

  
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">

  
            <div className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Name, Visitor, Plate, Code..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

  
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="">All</option>
                <option value="INSIDE">INSIDE</option>
                <option value="EXITED">EXITED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

  
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">From Date</label>
              <input 
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

  
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-1 block">To Date</label>
              <input 
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button onClick={clearFilters} className="text-sm font-bold text-slate-500 hover:text-indigo-600 underline">
            Clear Filters
          </button>
        </div>

  
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Visitor</th>
                  <th className="px-6 py-4">Host</th>
                  <th className="px-6 py-4">Plate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Plate Img</th>
                  <th className="px-6 py-4 text-center">Original</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-400">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-400">No records found.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id}>
                      <td className="px-6 py-4">
                        <b>{new Date(log.entryTime).toLocaleDateString()}</b>
                        <div className="text-xs">{new Date(log.entryTime).toLocaleTimeString()}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold">{log.guestName}</div>
                        <div className="text-xs text-slate-400">Code: {log.entryCode}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold">{log.hostName}</div>
                        <div className="text-xs text-slate-400">Flat: {log.flatNumber}</div>
                      </td>

                      <td className="px-6 py-4 font-mono">{log.plateNumber || "-"}</td>

                      <td className="px-6 py-4">
                        <StatusBadge status={log.status} />
                      </td>

  
                      <td className="px-6 py-4 text-center">
                        {log.plateImage ? (
                          <button onClick={() => setSelectedLog(log)} className="text-indigo-600 p-2">
                            <ImageIcon size={18} />
                          </button>
                        ) : "-"}
                      </td>

  
                      <td className="px-6 py-4 text-center">
                        {log.originalImage ? (
                          <button onClick={() => setSelectedOriginal(log)} className="text-indigo-600 p-2">
                            <ImageIcon size={18} />
                          </button>
                        ) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

  
          <div className="p-4 flex justify-between bg-slate-50 border-t">
            <div className="text-sm">{logs.length} of {totalRecords} records</div>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-white border rounded-lg">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold">Page {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 bg-white border rounded-lg">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modals */}
      {selectedLog && <ModalImage log={selectedLog} onClose={() => setSelectedLog(null)} imgField="plateImage" title="Plate Image" />}
      {selectedOriginal && <ModalImage log={selectedOriginal} onClose={() => setSelectedOriginal(null)} imgField="originalImage" title="Original Image" />}
    </div>
  );
}

// BADGE COMPONENT
const StatusBadge = ({ status }) => {
  const colors = {
    INSIDE: "bg-green-100 text-green-700 border-green-300",
    EXITED: "bg-slate-100 text-slate-600 border-slate-300",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status]}`}>
      {status}
    </span>
  );
};

// IMAGE MODAL
const ModalImage = ({ log, onClose, imgField, title }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center" onClick={onClose}>
    <div className="bg-white p-4 rounded-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4">
        <X size={28} className="text-white" />
      </button>

      <img src={log[imgField]} alt={title} className="w-full max-h-[70vh] object-contain bg-black" />

      <h3 className="text-lg font-bold mt-4">{title}</h3>
      <p className="text-sm text-slate-500">{new Date(log.entryTime).toLocaleString()}</p>
    </div>
  </div>
);
